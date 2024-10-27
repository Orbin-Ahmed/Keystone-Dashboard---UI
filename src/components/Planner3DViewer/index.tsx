import React, { useMemo, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { LineData, RoomName, ShapeData, TourPoint } from "@/types";
import {
  Vector3,
  TextureLoader,
  PerspectiveCamera,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Vector2,
  DoubleSide,
} from "three";
import { CSG } from "three-csg-ts";
import CustomButton from "../CustomButton";
import Model from "./Model";
import CameraController from "./CameraController";

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
  roomNames: RoomName[];
}

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({
  lines,
  shapes,
  roomNames,
}) => {
  // Wall Dimensions (in scene units)
  const wallHeight = 120;
  const wallThickness = 10;

  // Door and Window Dimensions (in scene units)
  const doorDimensions = { width: 60, height: 100 };
  const windowDimensions = { width: 60, height: 50 };

  const EYE_LEVEL = 70;

  const { centerX, centerY, minX, maxX, minY, maxY } = useMemo(() => {
    const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
    const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);
    return {
      minX: Math.min(...allX),
      maxX: Math.max(...allX),
      minY: Math.min(...allY),
      maxY: Math.max(...allY),
      centerX: (Math.min(...allX) + Math.max(...allX)) / 2,
      centerY: (Math.min(...allY) + Math.max(...allY)) / 2,
    };
  }, [lines]);

  // Create tour points based on room names
  const [tourPoints] = useState<TourPoint[]>(() =>
    roomNames.map((room) => ({
      id: room.name.toLowerCase().replace(/\s+/g, "-"),
      position: [room.x - centerX, EYE_LEVEL, room.y - centerY],
      lookAt: [room.x - centerX, EYE_LEVEL - 10, room.y - centerY],
      title: room.name,
    })),
  );

  const [activeTourPoint, setActiveTourPoint] = useState<TourPoint | null>(
    null,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showRoof, setShowRoof] = useState(false);

  const textures = {
    floor: useLoader(TextureLoader, "/textures/hardwood.png"),
    wall: useLoader(TextureLoader, "/textures/marbletiles.jpg"),
    roof: useLoader(TextureLoader, "/textures/wallmap_yellow.png"),
  };

  const cameraRef = useRef<PerspectiveCamera | null>(null);

  const handleZoomIn = () => {
    if (cameraRef.current instanceof PerspectiveCamera) {
      cameraRef.current.zoom = Math.min(cameraRef.current.zoom + 0.1, 5);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current instanceof PerspectiveCamera) {
      cameraRef.current.zoom = Math.max(cameraRef.current.zoom - 0.1, 0.5);
      cameraRef.current.updateProjectionMatrix();
    }
  };

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

  const Roof = () => {
    if (!showRoof) return null;

    const roofThickness = 2;

    const roofGeometry = useMemo(() => {
      return new BoxGeometry(maxX - minX, roofThickness, maxY - minY);
    }, [maxX, minX, maxY, minY, roofThickness]);

    const roofMaterial = useMemo(() => {
      return new MeshStandardMaterial({
        map: textures.roof,
        side: DoubleSide,
      });
    }, [textures.roof]);

    return (
      <mesh
        geometry={roofGeometry}
        material={roofMaterial}
        position={[0, wallHeight + roofThickness / 2, 0]}
      />
    );
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
        <CameraController
          activeTourPoint={activeTourPoint}
          isTransitioning={isTransitioning}
          setIsTransitioning={setIsTransitioning}
          isAutoRotating={isAutoRotating}
          setIsAutoRotating={setIsAutoRotating}
        />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 50, 25]} intensity={0.8} />
        <directionalLight position={[-10, 50, -25]} intensity={0.6} />
        <pointLight position={[0, 100, 0]} intensity={0.4} />
        <hemisphereLight intensity={0.3} />

        {tourPoints.map((point) => (
          <mesh
            key={point.id}
            position={point.position}
            onClick={() => handleTourPointClick(point)}
          >
            <sphereGeometry args={[5, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        ))}

        {/* Room Labels */}
        {roomNames.map((room) => (
          <RoomLabel
            key={room.id}
            position={[room.x - centerX, wallHeight / 2, room.y - centerY]}
            name={room.name}
          />
        ))}

        <Roof />
        <gridHelper
          args={[4000, 40, "#cccccc", "#e0e0e0"]}
          position={[0, -0.1, 0]}
        />

        {/* Floor Mesh*/}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[maxX - minX, maxY - minY]} />
          <meshStandardMaterial map={textures.floor} />
        </mesh>

        {/* Walls with Doors and Windows */}
        {lines.map((line, wallIndex) => {
          const [x1, y1, x2, y2] = line.points;
          const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const wallPosition = new Vector3(
            (x1 + x2) / 2 - centerX,
            wallHeight / 2,
            (y1 + y2) / 2 - centerY,
          );
          const angle = Math.atan2(y2 - y1, x2 - x1);

          // Determine if wall is facing inward
          const wallNormal = new Vector2(-(y2 - y1), x2 - x1).normalize();
          const wallCenter = new Vector2((x1 + x2) / 2, (y1 + y2) / 2);
          const toCenterVector = new Vector2(
            centerX - wallCenter.x,
            centerY - wallCenter.y,
          ).normalize();
          const dot = wallNormal.dot(toCenterVector);
          const isFacingInward = dot > 0;

          const wallGeometry = new BoxGeometry(
            length,
            wallHeight,
            wallThickness,
          );

          let wallMesh = new Mesh(
            wallGeometry,
            new MeshStandardMaterial({ map: textures.wall }),
          );

          const shapesOnWall = shapes.filter(
            (shape) => shape.wallIndex === wallIndex,
          );

          shapesOnWall.forEach((shape) => {
            const { type, x, y } = shape;

            // Use constants for cutout dimensions & Create cutout geometry
            const cutoutWidth =
              type === "door" ? doorDimensions.width : windowDimensions.width;
            const cutoutHeight =
              type === "door" ? doorDimensions.height : windowDimensions.height;
            const cutoutGeometry = new BoxGeometry(
              cutoutWidth,
              cutoutHeight,
              wallThickness,
            );
            const shapeWorldX = x - centerX;
            const shapeWorldZ = y - centerY;
            const dx = shapeWorldX - wallPosition.x;
            const dz = shapeWorldZ - wallPosition.z;
            const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
            const localY =
              type === "window"
                ? 0
                : -wallHeight / 2 + doorDimensions.height / 2;
            cutoutGeometry.translate(localX, localY, 0);
            const cutoutMesh = new Mesh(cutoutGeometry);
            wallMesh = CSG.subtract(
              wallMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
              cutoutMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
            ) as Mesh<BoxGeometry, MeshStandardMaterial>;
          });

          return (
            <group
              key={wallIndex}
              position={wallPosition}
              rotation={[0, -angle, 0]}
            >
              <primitive object={wallMesh} />
              {shapesOnWall.map((shape, shapeIndex) => {
                const { type, x, y } = shape;
                const modelPath =
                  type === "window"
                    ? "window/window_twin_casement.glb"
                    : "door/door.glb";
                const uniqueKey = `${wallIndex}-${shapeIndex}`;
                const shapeWorldX = x - centerX;
                const shapeWorldZ = y - centerY;
                const dx = shapeWorldX - wallPosition.x;
                const dz = shapeWorldZ - wallPosition.z;
                const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
                const localY =
                  type === "window"
                    ? 0
                    : -wallHeight / 2 + doorDimensions.height / 2;
                const rotationY =
                  type === "door"
                    ? isFacingInward
                      ? Math.PI
                      : 0
                    : isFacingInward
                      ? 0
                      : Math.PI;

                return (
                  <Model
                    key={uniqueKey}
                    path={modelPath}
                    position={[localX, localY, 0]}
                    rotation={[0, rotationY, 0]}
                    type={type}
                    wallThickness={wallThickness}
                    wallHeight={wallHeight}
                    doorDimensions={doorDimensions}
                    windowDimensions={windowDimensions}
                  />
                );
              })}
            </group>
          );
        })}
      </Canvas>
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: 1,
        }}
      >
        <CustomButton variant="secondary" onClick={handleZoomIn}>
          Zoom In
        </CustomButton>
        <CustomButton variant="secondary" onClick={handleZoomOut}>
          Zoom Out
        </CustomButton>
      </div>

      {/* UI Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h3 className="mb-2 text-lg font-bold">Virtual Tour</h3>
          <div className="flex flex-col gap-2">
            {tourPoints.map((point) => (
              <CustomButton
                key={point.id}
                variant={
                  activeTourPoint?.id === point.id ? "primary" : "secondary"
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
      </div>
    </>
  );
};

export default Plan3DViewer;

const RoomLabelComponent = ({
  position,
  name,
}: {
  position: [number, number, number];
  name: string;
}) => (
  <Text
    position={[position[0], 1, position[2]]}
    fontSize={10}
    color="black"
    anchorX="center"
    anchorY="bottom"
    rotation={[-Math.PI / 2, 0, 0]}
  >
    {name}
  </Text>
);

const RoomLabel = React.memo(RoomLabelComponent);
