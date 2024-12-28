import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  categories,
  FurnitureItem,
  LineData,
  PlacedItemType,
  PlacingItemType,
  RoomName,
  ShapeData,
  TourPoint,
  WallClassification,
} from "@/types";
import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";
import CustomButton from "@/components/CustomButton";
import SceneContent, {
  ensureWallPoints,
} from "@/components/Planner3DViewer/SceneContent";
import ItemSidebar from "./ItemSidebar";
import Stats from "stats.js";
import TourPointsList from "./sidebar/TourPointsList";
import ZoomControls from "./sidebar/ZoomControls";
import ModelSelectionSidebar from "./sidebar/ModelSelectionSidebar";
import ConfirmPlacementControls from "./sidebar/ConfirmPlacementControls";
import SelectedItemControls from "./sidebar/SelectedItemControls";
import SettingsModal from "./sidebar/SettingsModal";
import AddItemSidebar from "./sidebar/AddItemSidebar";

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
  roomNames: RoomName[];
  floorPlanPoints: { id: string; x: number; y: number }[];
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  furnitureItems: FurnitureItem[];
  setFurnitureItems: React.Dispatch<React.SetStateAction<FurnitureItem[]>>;
}

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({
  lines,
  shapes,
  roomNames,
  floorPlanPoints,
  centerX,
  centerY,
  minX,
  maxX,
  minY,
  maxY,
  furnitureItems,
  setFurnitureItems,
}) => {
  const [activeTourPoint, setActiveTourPoint] = useState<TourPoint | null>(
    null,
  );
  const [shouldExport, setShouldExport] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showRoof, setShowRoof] = useState(false);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const glRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const statsRef = useRef<Stats | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Window and Door Shape Data
  const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);
  const [modelPathsByShapeId, setModelPathsByShapeId] = useState<
    Record<string, string>
  >({});
  const [newWidth, setNewWidth] = useState<number | "">("");
  const [newHeight, setNewHeight] = useState<number | "">("");
  const [flipShape, setFlipShape] = useState<boolean>(false);
  const [shapeDimensionsById, setShapeDimensionsById] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [selectedModelPath, setSelectedModelPath] = useState<string | null>(
    null,
  );
  const [shapeFlipStatusById, setShapeFlipStatusById] = useState<
    Record<string, boolean>
  >({});

  // Item states
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [placingItem, setPlacingItem] = useState<PlacingItemType | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedItemType[]>([]);
  const [lastPlacedItemId, setLastPlacedItemId] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PlacedItemType | null>(null);

  // settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wallHeightSetting, setWallHeightSetting] = useState<number>(120);
  const [wallThicknessSetting, setWallThicknessSetting] = useState<number>(6);
  const [wallTextureSetting, setWallTextureSetting] =
    useState<string>("wallmap_yellow.png");
  const [floorTextureSetting, setFloorTextureSetting] = useState<string>(
    "crema_marfi_marble_tile_1.jpg",
  );
  const [ceilingTextureSetting, setCeilingTextureSetting] =
    useState<string>("wallmap_yellow.png");

  // Door & Window Model Options
  const doorOptions = [
    { label: "Glass Door", value: "door/door.glb" },
    { label: "Wooden Door 1", value: "door/door_wooden.glb" },
    { label: "Blast Door", value: "door/blastDoor.glb" },
    { label: "Open Doorway", value: "door/doorFrame.glb" },
    { label: "Wooden Door 2", value: "door/door_wooden_1.glb" },
  ];

  const windowOptions = [
    { label: "Standard Window", value: "window/window.glb" },
    { label: "Slide Window", value: "window/window_slide.glb" },
  ];

  const defaultDimensions = {
    door: { width: 50, height: 100 },
    window: { width: 60, height: 50 },
  };

  const EYE_LEVEL = 70;

  const tourPoints = useMemo(
    () =>
      roomNames.map((room) => ({
        id: room.name.toLowerCase().replace(/\s+/g, "-"),
        position: [
          room.x -
            (Math.min(...lines.flatMap((l) => [l.points[0], l.points[2]])) +
              Math.max(...lines.flatMap((l) => [l.points[0], l.points[2]]))) /
              2,
          EYE_LEVEL,
          room.y -
            (Math.min(...lines.flatMap((l) => [l.points[1], l.points[3]])) +
              Math.max(...lines.flatMap((l) => [l.points[1], l.points[3]]))) /
              2,
        ] as [number, number, number],
        lookAt: [
          room.x -
            (Math.min(...lines.flatMap((l) => [l.points[0], l.points[2]])) +
              Math.max(...lines.flatMap((l) => [l.points[0], l.points[2]]))) /
              2,
          EYE_LEVEL - 10,
          room.y -
            (Math.min(...lines.flatMap((l) => [l.points[1], l.points[3]])) +
              Math.max(...lines.flatMap((l) => [l.points[1], l.points[3]]))) /
              2,
        ] as [number, number, number],
        title: room.name,
      })),
    [roomNames],
  );

  const handleTourPointClick = (point: TourPoint) => {
    setActiveTourPoint(point);
    setIsTransitioning(true);
    setIsAutoRotating(true);
    setShowRoof(true);
  };

  const wallClassifications = useMemo(() => {
    const classifications: Record<string, WallClassification> = {};
    const tolerance = 5;

    const wallEndpoints: Array<[number, number, number, number]> = [];
    const wallIds: string[] = [];

    lines.forEach((line) => {
      wallEndpoints.push(ensureWallPoints(line.points));
      wallIds.push(line.id);
    });

    wallEndpoints.forEach((wall, wallIndex) => {
      const [x1, y1, x2, y2] = wall;
      const wallId = wallIds[wallIndex];
      const wallCenter = new Vector2((x1 + x2) / 2, (y1 + y2) / 2);
      const wallNormal = new Vector2(-(y2 - y1), x2 - x1).normalize();
      const toCenterVector = new Vector2(
        centerX - wallCenter.x,
        centerY - wallCenter.y,
      ).normalize();

      const isFacingInward = wallNormal.dot(toCenterVector) > 0;
      const isHorizontal = Math.abs(y1 - y2) < tolerance;
      const isVertical = Math.abs(x1 - x2) < tolerance;

      const isAtHorizontalBoundary =
        Math.abs(y1 - minY) < tolerance ||
        Math.abs(y1 - maxY) < tolerance ||
        Math.abs(y2 - minY) < tolerance ||
        Math.abs(y2 - maxY) < tolerance;

      const isAtVerticalBoundary =
        Math.abs(x1 - minX) < tolerance ||
        Math.abs(x1 - maxX) < tolerance ||
        Math.abs(x2 - minX) < tolerance ||
        Math.abs(x2 - maxX) < tolerance;

      const isOuter =
        (isHorizontal && isAtHorizontalBoundary) ||
        (isVertical && isAtVerticalBoundary);

      classifications[wallId] = {
        isOuter,
        isFacingInward,
      };
    });

    return classifications;
  }, [lines]);

  const handleExitTour = () => {
    setActiveTourPoint(null);
    setIsAutoRotating(false);
    setShowRoof(false);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 300, 500);
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.zoom = Math.min(cameraRef.current.zoom + 0.1, 5);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.zoom = Math.max(cameraRef.current.zoom - 0.1, 0.5);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const toggleTourList = () => {
    setIsSettingsOpen(false);
    setIsTourOpen((prev) => !prev);
    setIsItemsOpen(false);
  };

  const handleCloseSidebar = () => {
    setSelectedShape(null);
  };

  const handleItemClick = (item: PlacingItemType) => {
    setIsSettingsOpen(false);
    setPlacingItem((prev) => ({
      ...item,
      position: prev?.position || [0, 0, 0],
      rotation: prev?.rotation || [0, 0, 0],
    }));
    setIsItemsOpen(false);
  };

  const confirmPlacement = () => {
    if (placingItem) {
      const newItem: PlacedItemType = {
        ...placingItem,
        id: `item-${lastPlacedItemId + 1}`,
        position: placingItem.position || [0, 0, 0],
        rotation: placingItem.rotation || [0, 0, 0],
      };
      setPlacedItems((prev) => [...prev, newItem]);
      setLastPlacedItemId((prev) => prev + 1);
      setPlacingItem(null);
    }
  };

  const rotatePlacingItemLeft = () => {
    if (placingItem) {
      const currentRotation = placingItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] - Math.PI / 8;
      setPlacingItem({
        ...placingItem,
        rotation: [currentRotation[0], newRotationY, currentRotation[2]],
      });
    }
  };

  const rotatePlacingItemRight = () => {
    if (placingItem) {
      const currentRotation = placingItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] + Math.PI / 8;
      setPlacingItem({
        ...placingItem,
        rotation: [currentRotation[0], newRotationY, currentRotation[2]],
      });
    }
  };

  const deselectItem = () => {
    setSelectedItem(null);
  };

  const moveSelectedItem = () => {
    if (selectedItem) {
      setPlacingItem(selectedItem);
      setPlacedItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItem.id),
      );
      setSelectedItem(null);
    }
  };

  const rotateSelectedItemLeft = () => {
    if (selectedItem) {
      const currentRotation = selectedItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] - Math.PI / 8;
      updateSelectedItemRotation(newRotationY);
    }
  };

  const rotateSelectedItemRight = () => {
    if (selectedItem) {
      const currentRotation = selectedItem.rotation || [0, 0, 0];
      const newRotationY = currentRotation[1] + Math.PI / 8;
      updateSelectedItemRotation(newRotationY);
    }
  };

  const deleteSelectedItem = () => {
    if (selectedItem) {
      setPlacedItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItem.id),
      );
      setSelectedItem(null);
    }
  };

  const updateSelectedItemRotation = (newRotationY: number) => {
    if (selectedItem) {
      const updatedRotation: [number, number, number] = [
        selectedItem.rotation![0],
        newRotationY,
        selectedItem.rotation![2],
      ];
      const updatedItem: PlacedItemType = {
        ...selectedItem,
        rotation: updatedRotation,
      };
      setPlacedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id ? updatedItem : item,
        ),
      );
      setSelectedItem(updatedItem);
    }
  };

  const handleModelClick = (shape: ShapeData) => {
    setSelectedShape(shape);
    setIsTourOpen(false);
    setIsSettingsOpen(false);

    const dimensions = shapeDimensionsById[shape.id];
    const defaultDims = defaultDimensions[shape.type];

    setNewWidth(dimensions?.width || defaultDims.width);
    setNewHeight(dimensions?.height || defaultDims.height);

    const flipStatus = shapeFlipStatusById[shape.id] || false;
    setFlipShape(flipStatus);
    const wallClassification = wallClassifications[shape.wallId];
    const isOuter = wallClassification ? wallClassification.isOuter : false;
    setSelectedModelPath(modelPathsByShapeId[shape.id] || "");
  };

  const handleSaveChanges = () => {
    if (selectedShape) {
      if (newWidth && newHeight) {
        setShapeDimensionsById((prev) => ({
          ...prev,
          [selectedShape.id]: { width: newWidth, height: newHeight },
        }));
      }
      if (selectedModelPath) {
        setModelPathsByShapeId((prev) => ({
          ...prev,
          [selectedShape.id]: selectedModelPath,
        }));
      } else {
        setModelPathsByShapeId((prev) => {
          const updated = { ...prev };
          delete updated[selectedShape.id];
          return updated;
        });
      }
      setShapeFlipStatusById((prev) => ({
        ...prev,
        [selectedShape.id]: flipShape,
      }));

      setSelectedShape(null);
      setNewWidth("");
      setNewHeight("");
      setSelectedModelPath(null);
      setFlipShape(false);
    }
  };

  const handleSnap = async () => {
    if (glRef.current && cameraRef.current && sceneRef.current) {
      const renderer = glRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      renderer.render(scene, camera);
      const dataURL = renderer.domElement.toDataURL("image/jpeg");

      const link = document.createElement("a");
      link.download = "scene.jpg";
      link.href = dataURL;
      link.click();
      if (activeTourPoint) {
        const formData = new FormData();
        const input = {
          image: await fetch(dataURL)
            .then((res) => res.blob())
            .then(
              (blob) => new File([blob], "scene.jpg", { type: "image/jpeg" }),
            ),
          prompt: `A ${activeTourPoint.title.toLowerCase()}`,
          guidance_scale: 15,
          prompt_strength: 0.8,
          num_inference_steps: 50,
          negative_prompt:
            "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, functional, realistic",
        };

        formData.append("image", input.image);
        formData.append("prompt", input.prompt);
        formData.append("guidance_scale", input.guidance_scale.toString());
        formData.append("prompt_strength", input.prompt_strength.toString());
        formData.append(
          "num_inference_steps",
          input.num_inference_steps.toString(),
        );
        formData.append("negative_prompt", input.negative_prompt);

        // Send the API request
        try {
          const response = await fetch("/api/revampv2", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            console.log("API Response:", data);
          } else {
            console.error("API Error:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Fetch Error:", error);
        }
      }
    }
  };

  // useEffect(() => {
  //   const stats = new Stats();
  //   stats.showPanel(0);
  //   statsRef.current = stats;
  //   document.body.appendChild(stats.dom);

  //   return () => {
  //     document.body.removeChild(stats.dom);
  //   };
  // }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 300, 500], fov: 65, near: 1, far: 2000 }}
        onCreated={({ camera, gl, scene }) => {
          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
          glRef.current = gl;
          sceneRef.current = scene;
          // gl.setAnimationLoop(() => {
          //   if (statsRef.current) statsRef.current.begin();
          //   gl.render(scene, camera);
          //   if (statsRef.current) statsRef.current.end();
          // });
        }}
      >
        <SceneContent
          lines={lines}
          shapes={shapes}
          roomNames={roomNames}
          activeTourPoint={activeTourPoint}
          isTransitioning={isTransitioning}
          setIsTransitioning={setIsTransitioning}
          isAutoRotating={isAutoRotating}
          setIsAutoRotating={setIsAutoRotating}
          showRoof={showRoof}
          tourPoints={tourPoints}
          onTourPointClick={handleTourPointClick}
          floorPlanPoints={floorPlanPoints}
          centerX={centerX}
          centerY={centerY}
          minX={minX}
          maxX={maxX}
          minY={minY}
          maxY={maxY}
          onModelClick={handleModelClick}
          modelPathsByShapeId={modelPathsByShapeId}
          shapeDimensionsById={shapeDimensionsById}
          shouldExport={shouldExport}
          setShouldExport={setShouldExport}
          placingItem={placingItem}
          setPlacingItem={setPlacingItem}
          placedItems={placedItems}
          setPlacedItems={setPlacedItems}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          wallHeight={wallHeightSetting}
          wallThickness={wallThicknessSetting}
          wallTexture={wallTextureSetting}
          floorTexture={floorTextureSetting}
          ceilingTexture={ceilingTextureSetting}
          shapeFlipStatusById={shapeFlipStatusById}
          furnitureItems={furnitureItems}
          setFurnitureItems={setFurnitureItems}
        />
      </Canvas>

      {!selectedShape && (
        <div className="absolute right-4 top-4">
          <div className="flex gap-4">
            <CustomButton variant="tertiary" onClick={toggleTourList}>
              Tour Points
            </CustomButton>
            <AddItemSidebar
              onToggleItems={() => {
                setIsItemsOpen((prev) => !prev);
                setIsSettingsOpen(false);
                setIsTourOpen(false);
              }}
            />
          </div>

          {/* Tour Points List */}
          {isTourOpen && (
            <TourPointsList
              tourPoints={tourPoints}
              activeTourPoint={activeTourPoint}
              onTourPointClick={handleTourPointClick}
              onExitTour={handleExitTour}
            />
          )}

          {/* Items Sidebar */}
          {isItemsOpen && (
            <ItemSidebar
              categories={categories}
              onItemClick={handleItemClick}
            />
          )}
        </div>
      )}

      {/* Zoom Controls and Export Button */}
      <ZoomControls
        onSnap={handleSnap}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={() => setShouldExport(true)}
        onToggleSettings={() => {
          setIsSettingsOpen((prev) => !prev);
          setIsItemsOpen(false);
          setIsTourOpen(false);
        }}
      />

      {/* Sidebar for Model Selection */}
      {selectedShape && (
        <ModelSelectionSidebar
          selectedShape={selectedShape}
          flipShape={flipShape}
          setFlipShape={setFlipShape}
          newWidth={newWidth}
          setNewWidth={setNewWidth}
          newHeight={newHeight}
          setNewHeight={setNewHeight}
          selectedModelPath={selectedModelPath}
          setSelectedModelPath={setSelectedModelPath}
          doorOptions={doorOptions}
          windowOptions={windowOptions}
          onSaveChanges={handleSaveChanges}
          onClose={handleCloseSidebar}
        />
      )}

      {/* Confirm Placement Controls */}
      {placingItem && (
        <ConfirmPlacementControls
          onConfirmPlacement={confirmPlacement}
          onRotateLeft={rotatePlacingItemLeft}
          onRotateRight={rotatePlacingItemRight}
        />
      )}

      {/* Controls for Selected Item */}
      {selectedItem && (
        <SelectedItemControls
          onDeselect={deselectItem}
          onMove={moveSelectedItem}
          onRotateLeft={rotateSelectedItemLeft}
          onRotateRight={rotateSelectedItemRight}
          onDelete={deleteSelectedItem}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          wallHeight={wallHeightSetting}
          wallThickness={wallThicknessSetting}
          wallTexture={wallTextureSetting}
          floorTexture={floorTextureSetting}
          ceilingTexture={ceilingTextureSetting}
          onWallHeightChange={setWallHeightSetting}
          onWallThicknessChange={setWallThicknessSetting}
          onWallTextureChange={setWallTextureSetting}
          onFloorTextureChange={setFloorTextureSetting}
          onCeilingTextureChange={setCeilingTextureSetting}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default Plan3DViewer;
