import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  categories,
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
import InputField from "../InputField";
import ItemSidebar from "./ItemSidebar";
import { FaCamera, FaCog, FaFileExport } from "react-icons/fa";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import Stats from "stats.js";

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
  const [floorTextureSetting, setFloorTextureSetting] =
    useState<string>("golden.jpeg");
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

  const handleModelChange = (newModelPath: string) => {
    setSelectedModelPath(newModelPath);
  };

  const handleSnap = () => {
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
    }
  };

  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0: FPS
    statsRef.current = stats;
    document.body.appendChild(stats.dom);

    return () => {
      document.body.removeChild(stats.dom);
    };
  }, []);

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
          gl.setAnimationLoop(() => {
            if (statsRef.current) statsRef.current.begin();
            gl.render(scene, camera);
            if (statsRef.current) statsRef.current.end();
          });
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
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          wallHeight={wallHeightSetting}
          wallThickness={wallThicknessSetting}
          wallTexture={wallTextureSetting}
          floorTexture={floorTextureSetting}
          ceilingTexture={ceilingTextureSetting}
          shapeFlipStatusById={shapeFlipStatusById}
        />
      </Canvas>

      {/* Render UI Controls and the "Items" button when no shape is selected */}
      {!selectedShape && (
        <div className="absolute right-4 top-4">
          <div className="flex gap-4">
            <CustomButton variant="tertiary" onClick={toggleTourList}>
              Tour Points
            </CustomButton>
            <CustomButton
              variant="tertiary"
              onClick={() => {
                setIsItemsOpen((prev) => !prev);
                setIsSettingsOpen(false);
                setIsTourOpen(false);
              }}
            >
              Add Items
            </CustomButton>
          </div>

          {/* Tour Points List */}
          {isTourOpen && (
            <div className="mt-4 rounded-lg bg-white p-4 shadow-lg">
              <div className="flex flex-col gap-2">
                {tourPoints.map((point) => (
                  <CustomButton
                    key={point.id}
                    variant={
                      activeTourPoint?.id === point.id
                        ? "secondary"
                        : "tertiary"
                    }
                    onClick={() => handleTourPointClick(point)}
                  >
                    {point.title}
                  </CustomButton>
                ))}
                {activeTourPoint && (
                  <CustomButton variant="tertiary" onClick={handleExitTour}>
                    Exit Tour
                  </CustomButton>
                )}
              </div>
            </div>
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

      {/* Render Zoom Controls and Export Button */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <CustomButton variant="tertiary" onClick={handleSnap}>
          <FaCamera />
        </CustomButton>
        <CustomButton variant="tertiary" onClick={handleZoomIn}>
          <BsZoomIn />
        </CustomButton>
        <CustomButton variant="tertiary" onClick={handleZoomOut}>
          <BsZoomOut />
        </CustomButton>
        <CustomButton variant="tertiary" onClick={() => setShouldExport(true)}>
          <FaFileExport />
        </CustomButton>
        <CustomButton
          variant="tertiary"
          onClick={() => {
            setIsSettingsOpen((prev) => !prev);
            setIsItemsOpen(false);
            setIsTourOpen(false);
          }}
        >
          <FaCog />
        </CustomButton>
      </div>

      {/* Sidebar for Model Selection */}
      {selectedShape && (
        <div className="border-gray-200 fixed right-4 top-4 z-50 w-64 rounded-lg border bg-white p-4 shadow-lg">
          <h3 className="text-gray-800 mb-4 text-lg font-semibold">
            {selectedShape.type.toUpperCase()} Model (Inch)
          </h3>
          {/* Flip Checkbox */}
          <div className="my-3 flex items-center">
            <input
              type="checkbox"
              id="flip_checkbox"
              checked={flipShape}
              onChange={(e) => setFlipShape(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="flip_checkbox">Flip</label>
          </div>
          {/* Dimension Inputs */}
          <div className="my-3">
            <InputField
              className="my-2 px-3.5 py-2"
              name="width"
              id="width_id"
              type="number"
              placeholder="Width"
              value={newWidth}
              onChange={(e) => setNewWidth(Number(e.target.value))}
            />
            <InputField
              className="my-2 px-3.5 py-2"
              name="height"
              id="height_id"
              type="number"
              placeholder="Height"
              value={newHeight}
              onChange={(e) => setNewHeight(Number(e.target.value))}
            />
          </div>
          {/* Model Selection Dropdown */}
          <div className="my-3">
            <label htmlFor="model_select" className="mb-1 block">
              Select Model
            </label>
            <select
              id="model_select"
              value={selectedModelPath || ""}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="">Select a model</option>
              {(selectedShape.type === "door"
                ? doorOptions
                : windowOptions
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {/* Save Changes Button */}
          <CustomButton
            onClick={handleSaveChanges}
            variant="primary"
            className="m-auto w-full"
          >
            Save Changes
          </CustomButton>
          <CustomButton
            onClick={handleCloseSidebar}
            variant="secondary"
            className="m-auto mt-2 w-full"
          >
            Close
          </CustomButton>
        </div>
      )}
      {/* Sidebar for Model Selection */}

      {/* Confirm Placement Button */}
      {placingItem && (
        <div className="absolute bottom-20 right-4 flex flex-col gap-2">
          <CustomButton variant="primary" onClick={confirmPlacement}>
            Place Item
          </CustomButton>
          <div className="flex gap-2">
            <CustomButton variant="secondary" onClick={rotatePlacingItemLeft}>
              Rotate Left
            </CustomButton>
            <CustomButton variant="secondary" onClick={rotatePlacingItemRight}>
              Rotate Right
            </CustomButton>
          </div>
        </div>
      )}

      {/* Controls for Re-Selected Item */}
      {selectedItem && (
        <div className="absolute bottom-20 right-4 flex flex-col gap-2">
          <CustomButton variant="primary" onClick={deselectItem}>
            Deselect Item
          </CustomButton>
          <div className="flex gap-2">
            <CustomButton variant="secondary" onClick={moveSelectedItem}>
              Move
            </CustomButton>
            <CustomButton variant="secondary" onClick={rotateSelectedItemLeft}>
              Rotate Left
            </CustomButton>
            <CustomButton variant="secondary" onClick={rotateSelectedItemRight}>
              Rotate Right
            </CustomButton>
            <CustomButton onClick={deleteSelectedItem}>Delete</CustomButton>
          </div>
        </div>
      )}

      {/* settings  */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="border-gray-200 w-72 rounded-lg border bg-white p-6 shadow-lg">
            <h3 className="text-gray-800 mb-4 text-lg font-semibold">
              Settings
            </h3>

            {/* Wall Height Input */}
            <div className="mb-4">
              <label
                htmlFor="wall_height"
                className="text-gray-700 block text-sm font-medium"
              >
                Wall Height (Inch)
              </label>
              <InputField
                className="border-gray-300 mt-2 w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                name="wall_height"
                id="wall_height"
                type="number"
                placeholder="Wall Height"
                value={wallHeightSetting}
                onChange={(e) => setWallHeightSetting(Number(e.target.value))}
              />
            </div>

            {/* Wall Thickness Input */}
            <div className="mb-4">
              <label
                htmlFor="wall_thickness"
                className="text-gray-700 block text-sm font-medium"
              >
                Wall Thickness (Inch)
              </label>
              <InputField
                className="border-gray-300 mt-2 w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                name="wall_thickness"
                id="wall_thickness"
                type="number"
                placeholder="Wall Thickness"
                value={wallThicknessSetting}
                onChange={(e) =>
                  setWallThicknessSetting(Number(e.target.value))
                }
              />
            </div>

            {/* Wall Texture Selection */}
            <div className="mb-4">
              <label
                htmlFor="wall_texture"
                className="text-gray-700 block text-sm font-medium"
              >
                Wall Texture
              </label>
              <select
                id="wall_texture"
                value={wallTextureSetting}
                onChange={(e) => setWallTextureSetting(e.target.value)}
                className="border-gray-300 mt-2 w-full rounded border bg-white px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              >
                <option value="wallmap_yellow.png">Yellow Wall</option>
                <option value="walllightmap.png">White Wall</option>
                <option value="marbletiles.jpg">Brick Wall</option>
              </select>
            </div>

            {/* Floor Texture Selection */}
            <div className="mb-4">
              <label
                htmlFor="floor_texture"
                className="text-gray-700 block text-sm font-medium"
              >
                Floor Texture
              </label>
              <select
                id="floor_texture"
                value={floorTextureSetting}
                onChange={(e) => setFloorTextureSetting(e.target.value)}
                className="border-gray-300 mt-2 w-full rounded border bg-white px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              >
                <option value="golden.jpeg">Golden Marble</option>
                <option value="white_marble.jpg">White Marble</option>
                <option value="blue.jpg">Blue Marble</option>
                <option value="white_tiles.jpg">White Tiles</option>
                <option value="hardwood.png">Wooden Floor</option>
                <option value="light_fine_wood.jpg">Light Wooden Floor</option>
                <option value="golden_marble_tiles.jpg">
                  Golden Marble Tiles
                </option>
                <option value="white_marble_tiles_1.jpg">
                  White Marble Tiles
                </option>
                <option value="dark_brown_marble_tiles.jpg">
                  Dark Brown Marble Tiles
                </option>
                <option value="brown_marble_tiles.jpg">
                  Brown Marble Tiles
                </option>
                <option value="gray_marble_tiles.jpg">Gray Marble Tiles</option>
              </select>
            </div>

            {/* Ceiling Texture Selection */}
            <div className="mb-4">
              <label
                htmlFor="ceiling_texture"
                className="text-gray-700 block text-sm font-medium"
              >
                Ceiling Texture
              </label>
              <select
                id="ceiling_texture"
                value={ceilingTextureSetting}
                onChange={(e) => setCeilingTextureSetting(e.target.value)}
                className="border-gray-300 mt-2 w-full rounded border bg-white px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              >
                <option value="wallmap_yellow.png">Yellow Ceiling</option>
                <option value="walllightmap.png">White Ceiling</option>
              </select>
            </div>

            {/* Close Button */}
            <CustomButton
              onClick={() => setIsSettingsOpen(false)}
              variant="secondary"
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 w-full rounded px-4 py-2 text-sm font-medium"
            >
              Close
            </CustomButton>
          </div>
        </div>
      )}
    </>
  );
};

export default Plan3DViewer;
