import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LineData, ShapeData } from "@/types";
import {
  Vector3,
  TextureLoader,
  PerspectiveCamera,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Vector2,
} from "three";
import { CSG } from "three-csg-ts";
import CustomButton from "../CustomButton";
import Model from "./Model";

interface TourPoint {
  id: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  title: string;
}

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
}

const CameraController = ({
  activeTourPoint,
  isTransitioning,
  setIsTransitioning,
  isAutoRotating,
  setIsAutoRotating,
}: {
  activeTourPoint: TourPoint | null;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  isAutoRotating: boolean;
  setIsAutoRotating: (value: boolean) => void;
}) => {
  const { camera } = useThree();
  const targetPos = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());
  const rotationAngle = useRef(0);
  const rotationRadius = useRef(360); // Distance from look-at point
  const rotationSpeed = 0.005; // Speed of auto-rotation
  const manualRotationSpeed = 1; // Speed of manual rotation

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeTourPoint || isTransitioning) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        // Stop auto-rotation when user starts manual control
        setIsAutoRotating(false);

        const direction = event.key === "ArrowLeft" ? 1 : -1;
        rotationAngle.current += direction * manualRotationSpeed;

        const currentPos = new Vector3(...activeTourPoint.position);
        const lookAtPoint = new Vector3(...activeTourPoint.lookAt);

        // Calculate new camera position based on rotation
        const offset = new Vector3(
          Math.sin(rotationAngle.current) * rotationRadius.current,
          0,
          Math.cos(rotationAngle.current) * rotationRadius.current,
        );

        camera.position.copy(currentPos);
        camera.lookAt(lookAtPoint.add(offset));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTourPoint, isTransitioning, camera, setIsAutoRotating]);

  // Handle auto-rotation and transitions
  useFrame(() => {
    if (!activeTourPoint) return;

    if (isTransitioning) {
      const targetPosition = new Vector3(...activeTourPoint.position);
      const targetLookat = new Vector3(...activeTourPoint.lookAt);

      targetPos.current.lerp(targetPosition, 0.05);
      targetLookAt.current.lerp(targetLookat, 0.05);

      camera.position.copy(targetPos.current);
      currentLookAt.current.lerp(targetLookAt.current, 0.05);
      camera.lookAt(currentLookAt.current);

      if (targetPos.current.distanceTo(targetPosition) < 0.1) {
        setIsTransitioning(false);
      }
    } else if (isAutoRotating) {
      rotationAngle.current += rotationSpeed;

      const currentPos = new Vector3(...activeTourPoint.position);
      const lookAtPoint = new Vector3(...activeTourPoint.lookAt);

      // Calculate new camera position for auto-rotation
      const offset = new Vector3(
        Math.sin(rotationAngle.current) * rotationRadius.current,
        0,
        Math.cos(rotationAngle.current) * rotationRadius.current,
      );

      camera.position.copy(currentPos);
      camera.lookAt(lookAtPoint.add(offset));
    }
  });

  return null;
};

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({ lines, shapes }) => {
  // Wall Dimensions (in scene units)
  const wallHeight = 120;
  const wallThickness = 10;

  // Door and Window Dimensions (in scene units)
  const doorDimensions = { width: 60, height: 100 };
  const windowDimensions = { width: 60, height: 50 };

  const EYE_LEVEL = 70;

  const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
  const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Virtual tour state
  const [tourPoints] = useState<TourPoint[]>([
    {
      id: "entrance",
      position: [0, EYE_LEVEL, 300],
      lookAt: [0, EYE_LEVEL - 10, 0],
      title: "Entrance",
    },
    {
      id: "living-room",
      position: [-200, EYE_LEVEL, 0],
      lookAt: [0, EYE_LEVEL - 10, 0],
      title: "Living Room",
    },
    {
      id: "kitchen",
      position: [200, EYE_LEVEL, 0],
      lookAt: [0, EYE_LEVEL - 10, 0],
      title: "Kitchen",
    },
  ]);

  const [activeTourPoint, setActiveTourPoint] = useState<TourPoint | null>(
    null,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  const floorTexture = useLoader(TextureLoader, "/textures/hardwood.png");
  const outWallTexture = useLoader(TextureLoader, "/textures/marbletiles.jpg");

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
    setControlsEnabled(false);
    // Start auto-rotation when arriving at a new point
    setIsAutoRotating(true);
  };

  const handleExitTour = () => {
    setActiveTourPoint(null);
    setControlsEnabled(true);
    setIsAutoRotating(false);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 150, 500);
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const toggleAutoRotation = () => {
    setIsAutoRotating(!isAutoRotating);
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

        <ambientLight intensity={1} />
        <directionalLight position={[10, 50, 25]} intensity={1} />
        <pointLight position={[0, 100, 0]} intensity={0.5} />
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0.1}
          maxDistance={1000}
        />

        {/* Tour Point Markers */}
        {tourPoints.map((point) => (
          <mesh
            key={point.id}
            position={point.position}
            onClick={() => handleTourPointClick(point)}
          >
            <sphereGeometry args={[5, 32, 32]} />
            <meshStandardMaterial
              color={activeTourPoint?.id === point.id ? "#ff0000" : "#00ff00"}
            />
          </mesh>
        ))}

        <gridHelper
          args={[4000, 40, "#cccccc", "#e0e0e0"]}
          position={[0, -0.1, 0]}
        />

        {/* Floor Mesh*/}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[maxX - minX, maxY - minY]} />
          <meshStandardMaterial map={floorTexture} />
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
            new MeshStandardMaterial({ map: outWallTexture }),
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
                  type === "window" ? "window_slide.glb" : "door.glb";
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
                const rotationY = isFacingInward ? Math.PI : 0;

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

      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h3 className="mb-2 text-lg font-bold">Virtual Tour Controls</h3>
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
              <>
                {/* <CustomButton variant="secondary" onClick={toggleAutoRotation}>
                  {isAutoRotating
                    ? "Stop Auto-Rotation"
                    : "Start Auto-Rotation"}
                </CustomButton> */}
                <CustomButton variant="secondary" onClick={handleExitTour}>
                  Exit Tour
                </CustomButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Controls Info */}
      {/* {activeTourPoint && (
        <div className="absolute right-4 top-4 rounded-lg bg-white p-4 shadow-lg">
          <h4 className="mb-2 font-bold">Keyboard Controls:</h4>
          <p>← Left Arrow: Rotate Left</p>
          <p>→ Right Arrow: Rotate Right</p>
        </div>
      )} */}
    </>
  );
};

export default Plan3DViewer;
