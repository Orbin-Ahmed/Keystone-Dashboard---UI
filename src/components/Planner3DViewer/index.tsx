import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  LineData,
  PlacedItemType,
  PlacingItemType,
  RoomName,
  ShapeData,
  TourPoint,
} from "@/types";
import { PerspectiveCamera } from "three";
import CustomButton from "@/components/CustomButton";
import SceneContent from "@/components/Planner3DViewer/SceneContent";
import InputField from "../InputField";
import ItemSidebar from "./ItemSidebar";

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
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Window and Door Shape Data
  const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);
  const [modelPathsByShapeId, setModelPathsByShapeId] = useState<
    Record<string, string>
  >({});
  const [newWidth, setNewWidth] = useState<number | "">("");
  const [newHeight, setNewHeight] = useState<number | "">("");
  const [shapeDimensionsById, setShapeDimensionsById] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [selectedModelPath, setSelectedModelPath] = useState<string | null>(
    null,
  );

  // Item states
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [placingItem, setPlacingItem] = useState<PlacingItemType | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedItemType[]>([]);
  const [lastPlacedItemId, setLastPlacedItemId] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PlacedItemType | null>(null);

  // Items categories
  const categories = [
    {
      name: "Living Room",
      items: [
        {
          name: "Sofa",
          path: "items/sofa.glb",
          type: "sofa",
          width: 110,
          height: 45,
          depth: 50,
        },
        {
          name: "TV Stand",
          path: "items/tv_stand.glb",
          type: "tv_stand",
          width: 100,
          height: 38,
          depth: 30,
        },
      ],
    },
    {
      name: "Bed Room",
      items: [
        {
          name: "Bed",
          path: "items/bed.glb",
          type: "bed",
          width: 136,
          height: 32,
          depth: 98,
        },
        {
          name: "Wardrobe",
          path: "items/wardrobe.glb",
          type: "wardrobe",
          width: 130,
          height: 108,
          depth: 33,
        },
      ],
    },
    {
      name: "Kitchen",
      items: [
        {
          name: "Fridge",
          path: "items/fridge.glb",
          type: "fridge",
          width: 48,
          height: 115,
          depth: 42,
        },
        {
          name: "Cabinets",
          path: "items/cabinets.glb",
          type: "cabinets",
          width: 48,
          height: 96,
          depth: 24,
        },
        {
          name: "Sink",
          path: "items/sink.glb",
          type: "sink",
          width: 120,
          height: 70,
          depth: 35,
        },
        {
          name: "shelf",
          path: "items/shelf.glb",
          type: "shelf",
          width: 60,
          height: 108,
          depth: 35,
        },
        {
          name: "Drawer",
          path: "items/drawer.glb",
          type: "drawer",
          width: 90,
          height: 48,
          depth: 35,
        },
        {
          name: "Table",
          path: "items/side_table.glb",
          type: "side_table",
          width: 20,
          height: 48,
          depth: 35,
        },
        {
          name: "Stove",
          path: "items/stove.glb",
          type: "stove",
          width: 32,
          height: 48,
          depth: 35,
        },
      ],
    },
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
    [roomNames, lines],
  );

  const handleTourPointClick = (point: TourPoint) => {
    setActiveTourPoint(point);
    setIsTransitioning(true);
    setIsAutoRotating(true);
    setShowRoof(true);
  };

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
    setIsTourOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSelectedShape(null);
  };

  const handleItemClick = (item: PlacingItemType) => {
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

    const dimensions = shapeDimensionsById[shape.id];
    const defaultDims = defaultDimensions[shape.type];

    setNewWidth(dimensions?.width || defaultDims.width);
    setNewHeight(dimensions?.height || defaultDims.height);
  };

  const handleSaveChanges = () => {
    if (selectedShape) {
      // Update dimensions
      if (newWidth && newHeight) {
        setShapeDimensionsById((prev) => ({
          ...prev,
          [selectedShape.id]: { width: newWidth, height: newHeight },
        }));
      }
      // Update model path
      if (selectedModelPath) {
        setModelPathsByShapeId((prev) => ({
          ...prev,
          [selectedShape.id]: selectedModelPath,
        }));
      }
      // Reset selection
      setSelectedShape(null);
      setNewWidth("");
      setNewHeight("");
      setSelectedModelPath(null);
    }
  };

  const handleModelChange = (newModelPath: string) => {
    setSelectedModelPath(newModelPath);
  };

  return (
    <>
      <Canvas
        camera={{ position: [0, 300, 500], fov: 65, near: 1, far: 2000 }}
        onCreated={({ camera }) => {
          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
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
              onClick={() => setIsItemsOpen((prev) => !prev)}
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
        <CustomButton variant="secondary" onClick={handleZoomIn}>
          Zoom In
        </CustomButton>
        <CustomButton variant="secondary" onClick={handleZoomOut}>
          Zoom Out
        </CustomButton>
        <CustomButton variant="secondary" onClick={() => setShouldExport(true)}>
          Export Scene
        </CustomButton>
      </div>

      {/* Sidebar for Model Selection */}
      {selectedShape && (
        <div className="border-gray-200 fixed right-4 top-4 z-50 w-64 rounded-lg border bg-white p-4 shadow-lg">
          <h3 className="text-gray-800 mb-4 text-lg font-semibold">
            {selectedShape.type.toUpperCase()} Model
          </h3>
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
          {/* Model Variant Buttons */}
          {selectedShape.type === "door" ? (
            <>
              <CustomButton
                onClick={() => handleModelChange("door/door.glb")}
                className="mb-2 w-full text-left"
              >
                Glass Door
              </CustomButton>
              <CustomButton
                onClick={() => handleModelChange("door/door_wooden.glb")}
                className="mb-2 w-full text-left"
              >
                Wooden Door
              </CustomButton>
            </>
          ) : (
            <>
              <CustomButton
                onClick={() =>
                  handleModelChange("window/window_twin_casement.glb")
                }
                className="mb-2 w-full text-left"
              >
                Standard Window
              </CustomButton>
              <CustomButton
                onClick={() => handleModelChange("window/window_slide.glb")}
                className="mb-2 w-full text-left"
              >
                Slide Window
              </CustomButton>
            </>
          )}
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
    </>
  );
};

export default Plan3DViewer;
