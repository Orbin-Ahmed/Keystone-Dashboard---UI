import React, { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { LineData, RoomName, ShapeData, TourPoint } from "@/types";
import { PerspectiveCamera } from "three";
import CustomButton from "@/components/CustomButton";
import SceneContent from "@/components/Planner3DViewer/SceneContent";

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
  const [selectedShape, setSelectedShape] = useState<ShapeData | null>(null);
  const [modelPathsByShapeId, setModelPathsByShapeId] = useState<
    Record<string, string>
  >({});

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

  const handleModelClick = (shape: ShapeData) => {
    setSelectedShape(shape);
    setIsTourOpen(false);
  };

  const handleModelChange = (newModelPath: string) => {
    if (selectedShape) {
      setModelPathsByShapeId((prev) => ({
        ...prev,
        [selectedShape.id]: newModelPath,
      }));
      setSelectedShape(null);
    }
  };

  const handleCloseSidebar = () => {
    setSelectedShape(null);
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
          shouldExport={shouldExport}
          setShouldExport={setShouldExport}
        />
      </Canvas>
      {!selectedShape && (
        <>
          {/* UI Controls */}
          <div className="absolute right-4 top-4">
            <CustomButton variant="primary" onClick={toggleTourList}>
              {isTourOpen ? "Hide Tour Points" : "Show Tour Points"}
            </CustomButton>

            {/* Tour Points List */}
            {isTourOpen && (
              <div className="mt-4 rounded-lg bg-white p-4 shadow-lg">
                <h3 className="text-lg font-bold">Virtual Tour</h3>
                <div className="flex flex-col gap-2">
                  {tourPoints.map((point) => (
                    <CustomButton
                      key={point.id}
                      variant={
                        activeTourPoint?.id === point.id
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() => handleTourPointClick(point)}
                    >
                      {point.title}
                    </CustomButton>
                  ))}
                  {activeTourPoint && (
                    <CustomButton variant="secondary" onClick={handleExitTour}>
                      Exit Tour
                    </CustomButton>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          {!isTourOpen && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <CustomButton variant="secondary" onClick={handleZoomIn}>
                Zoom In
              </CustomButton>
              <CustomButton variant="secondary" onClick={handleZoomOut}>
                Zoom Out
              </CustomButton>
              <CustomButton
                variant="secondary"
                onClick={() => setShouldExport(true)}
              >
                Export Scene
              </CustomButton>
            </div>
          )}
        </>
      )}

      {/* Sidebar for Model Selection */}
      {selectedShape && (
        <div className="border-gray-200 fixed right-4 top-4 z-50 w-64 rounded-lg border bg-white p-4 shadow-lg">
          <h3 className="text-gray-800 mb-4 text-lg font-semibold">
            Select a {selectedShape.type} Model
          </h3>
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
          <CustomButton
            onClick={handleCloseSidebar}
            variant="secondary"
            className="m-auto w-full"
          >
            Close
          </CustomButton>
        </div>
      )}
    </>
  );
};

export default Plan3DViewer;
