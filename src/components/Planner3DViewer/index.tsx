import React, { useRef } from "react";
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
import { OBJLoader } from "three-stdlib";
import { CSG } from "three-csg-ts";
import CustomButton from "../CustomButton";

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
}

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({ lines, shapes }) => {
  const wallHeight = 120;
  const wallThickness = 10;

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

  const grassTexture = useLoader(TextureLoader, "/textures/grass.png");
  // const grassTexture = useLoader(TextureLoader, "/textures/walllightmap.png");
  const floorTexture = useLoader(TextureLoader, "/textures/floor.png");
  // const outWallTexture = useLoader(TextureLoader, "/textures/out_wall.png");
  const outWallTexture = useLoader(
    TextureLoader,
    "/textures/wallmap_yellow.png",
  );

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

  return (
    <>
      <Canvas
        camera={{ position: [0, 300, 500], fov: 50, near: 1, far: 5000 }}
        onCreated={({ camera }) => {
          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 50, 25]} intensity={1} />
        <hemisphereLight intensity={0.35} />
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
        {lines.map((line, index) => {
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
            (shape) => shape.wallIndex === index,
          );

          shapesOnWall.forEach((shape) => {
            const { type, x, y } = shape;

            // Calculate cutout dimensions based on the scale
            const cutoutWidth =
              type === "door" ? 0.4 * wallHeight : 0.48 * wallHeight;
            const cutoutHeight =
              type === "door" ? wallHeight * 0.85 : 0.42 * wallHeight;

            // Create cutout geometry for doors/windows
            const cutoutGeometry = new BoxGeometry(
              cutoutWidth,
              cutoutHeight,
              wallThickness, // Make cutout slightly thicker to ensure complete removal
            );

            const shapeWorldX = x - centerX;
            const shapeWorldZ = y - centerY;

            const dx = shapeWorldX - wallPosition.x;
            const dz = shapeWorldZ - wallPosition.z;

            const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
            const localY =
              type === "window"
                ? cutoutHeight / 10 - 13
                : cutoutHeight / 10 - 23;

            cutoutGeometry.translate(localX, localY, 0);
            const cutoutMesh = new Mesh(cutoutGeometry);

            // Apply CSG subtraction to create cutout in the wall
            wallMesh = CSG.subtract(
              wallMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
              cutoutMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
            ) as Mesh<BoxGeometry, MeshStandardMaterial>;
          });

          return (
            <group
              key={index}
              position={wallPosition}
              rotation={[0, -angle, 0]}
            >
              <primitive object={wallMesh} />

              {/* Doors and Windows */}
              {shapesOnWall.map((shape, shapeIndex) => {
                const { type, x, y } = shape;
                const modelPath = type === "window" ? "window.obj" : "door.obj";

                const shapeWorldX = x - centerX;
                const shapeWorldZ = y - centerY;

                const dx = shapeWorldX - wallPosition.x;
                const dz = shapeWorldZ - wallPosition.z;

                const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
                const localZ = -dx * Math.sin(angle) + dz * Math.cos(angle);

                // Adjust shape position to align with wall thickness
                const shapePosition: [number, number, number] = [
                  type === "door" ? localX + 5 : localX,
                  type === "window" ? wallHeight / 10 - 20 : -8, // Place windows in the middle of the wall and doors at ground level
                  wallThickness / 2 - 5, // Slight offset to make sure they protrude from the wall slightly
                ];

                const modelRotationOffset = Math.PI / 2;

                return (
                  <Model
                    key={shapeIndex}
                    path={modelPath}
                    position={shapePosition}
                    rotation={[modelRotationOffset, 0, 0]}
                    scale={
                      type === "door"
                        ? [0.5, 1, 0.4] // Scale the door to fit within the wall thickness
                        : [1.2, 1, 1.2] // Scale the window properly and adjust depth to fit within wall
                    }
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

const Model = ({
  path,
  position,
  rotation,
  scale,
}: {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) => {
  const object = useLoader(OBJLoader, path, (loader) => {
    loader.setPath("/models/");
  });

  return (
    <primitive
      object={object.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};
