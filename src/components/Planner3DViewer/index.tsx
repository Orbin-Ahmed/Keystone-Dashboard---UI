import React, { useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LineData, ShapeData } from "@/types";
import {
  Vector3,
  TextureLoader,
  PerspectiveCamera,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
} from "three";
import { CSG } from "three-csg-ts";
import CustomButton from "../CustomButton";
import Model from "./Model";

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
}

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({ lines, shapes }) => {
  const wallHeight = 120;
  const wallThickness = 10;

  // Door Dimensions (in scene units)
  const DOOR_WIDTH = 60;
  const DOOR_HEIGHT = 100;

  // Window Dimensions (in scene units)
  const WINDOW_WIDTH = 60;
  const WINDOW_HEIGHT = 50;

  const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
  const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const planeWidth = Math.abs(maxX - minX) + 2000;
  const planeHeight = Math.abs(maxY - minY) + 2000;

  const grassTexture = useLoader(TextureLoader, "/textures/grass1.jpg");
  const floorTexture = useLoader(TextureLoader, "/textures/floor.png");
  const outWallTexture = useLoader(
    TextureLoader,
    "/textures/wallmap_yellow.png",
  );

  const cameraRef = useRef<PerspectiveCamera | null>(null);

  // Initialize state for position and scale
  const [shapesPositions, setShapesPositions] = useState<{
    [key: string]: [number, number, number];
  }>({});
  const [shapesScales, setShapesScales] = useState<{
    [key: string]: [number, number, number];
  }>({});

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

  return (
    <>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 300, 500], fov: 50, near: 1, far: 5000 }}
        onCreated={({ camera }) => {
          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight
          position={[10, 50, 25]}
          intensity={1}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 100, 0]} intensity={0.5} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
        />
        {/* Grass Surface */}
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[planeWidth, planeHeight]} />
          <meshStandardMaterial map={grassTexture} />
        </mesh>
        {/* Floor */}
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

            // Use constants for cutout dimensions
            const cutoutWidth = type === "door" ? DOOR_WIDTH : WINDOW_WIDTH;
            const cutoutHeight = type === "door" ? DOOR_HEIGHT : WINDOW_HEIGHT;

            // Create cutout geometry
            const cutoutGeometry = new BoxGeometry(
              cutoutWidth,
              cutoutHeight,
              wallThickness,
            );

            // Calculate position within the wall
            const shapeWorldX = x - centerX;
            const shapeWorldZ = y - centerY;

            const dx = shapeWorldX - wallPosition.x;
            const dz = shapeWorldZ - wallPosition.z;

            const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
            const localY =
              type === "window" ? 0 : -wallHeight / 2 + DOOR_HEIGHT / 2;

            cutoutGeometry.translate(localX, localY, 0);
            const cutoutMesh = new Mesh(cutoutGeometry);

            // Apply CSG subtraction
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

              {/* Doors and Windows */}
              {shapesOnWall.map((shape, shapeIndex) => {
                const { type, x, y } = shape;
                const modelPath =
                  type === "window" ? "window1.glb" : "door.glb";

                // Create a unique key for each shape using wallIndex and shapeIndex
                const uniqueKey = `${wallIndex}-${shapeIndex}`;

                // Calculate position within the wall
                const shapeWorldX = x - centerX;
                const shapeWorldZ = y - centerY;

                const dx = shapeWorldX - wallPosition.x;
                const dz = shapeWorldZ - wallPosition.z;

                const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
                const localY =
                  type === "window" ? 0 : -wallHeight / 2 + DOOR_HEIGHT / 2;

                const shapePosition = shapesPositions[uniqueKey] || [0, 0, 0];
                const shapeScale = shapesScales[uniqueKey] || [1, 1, 1];

                return (
                  <Model
                    key={uniqueKey}
                    path={modelPath}
                    position={shapePosition}
                    rotation={[0, 0, 0]}
                    scale={shapeScale}
                    onLoaded={({ dimensions, center }) => {
                      // Calculate scaling factors
                      const scaleX =
                        (type === "door" ? DOOR_WIDTH : WINDOW_WIDTH) /
                        dimensions.width;
                      const scaleY =
                        (type === "door" ? DOOR_HEIGHT : WINDOW_HEIGHT) /
                        dimensions.height;
                      const scaleZ = wallThickness / dimensions.depth;

                      setShapesScales((prevScales) => ({
                        ...prevScales,
                        [uniqueKey]: [scaleX, scaleY, scaleZ],
                      }));

                      // Adjust position to align with cutout
                      const adjustedLocalX = localX - center.x * scaleX;
                      const adjustedLocalY = localY - center.y * scaleY;
                      const adjustedLocalZ = -center.z * scaleZ;

                      setShapesPositions((prevPositions) => ({
                        ...prevPositions,
                        [uniqueKey]: [
                          adjustedLocalX,
                          adjustedLocalY,
                          adjustedLocalZ,
                        ],
                      }));
                    }}
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
    </>
  );
};

export default Plan3DViewer;
