import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LineData, ShapeData } from "@/types";
import { Vector3, TextureLoader, PerspectiveCamera, Group } from "three";
import { OBJLoader } from "three-stdlib";
import CustomButton from "../CustomButton";

interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
}

const Plan3DViewer: React.FC<Plan3DViewerProps> = ({ lines, shapes }) => {
  console.log(shapes);
  const wallHeight = 100;
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

  const grassTexture = new TextureLoader().load("/textures/grass.png");
  const floorTexture = new TextureLoader().load("/textures/floor.png");
  const outWallTexture = new TextureLoader().load("/textures/out_wall.png");

  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const sceneRef = useRef<Group | null>(null);

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

  useEffect(() => {
    const loadModels = () => {
      const loader = new OBJLoader();
      shapes.forEach((shape) => {
        console.log(shape);
        const { type, x, y, width, height, rotation } = shape;
        if (type === "window" || type === "door") {
          const modelPath =
            type === "window" ? "/models/window.obj" : "/models/door.obj";
          loader.load(
            modelPath,
            (object) => {
              object.position.set(x - centerX, wallHeight / 2, y - centerY);
              object.rotation.y = rotation ? (rotation * Math.PI) / 180 : 0;
              object.scale.set(width / 100, height / 100, 1);
              sceneRef.current?.add(object);
            },
            undefined,
            (error) => {
              console.error(`Failed to load ${type} model:`, error);
            },
          );
        }
      });
    };

    loadModels();
  }, [shapes, centerX, centerY]);

  return (
    <>
      <Canvas
        camera={{ position: [0, 300, 500], fov: 50, near: 1, far: 5000 }}
        onCreated={({ camera, scene }) => {
          if (camera instanceof PerspectiveCamera) {
            cameraRef.current = camera;
          }
          if (scene instanceof Group) {
            sceneRef.current = scene;
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

        {/* Walls */}
        {lines.map((line, index) => {
          const [x1, y1, x2, y2] = line.points;
          const length: number = Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2),
          );
          const wallPosition: Vector3 = new Vector3(
            (x1 + x2) / 2 - centerX,
            wallHeight / 2,
            (y1 + y2) / 2 - centerY,
          );

          const angle: number = Math.atan2(y2 - y1, x2 - x1);

          return (
            <group key={index}>
              <mesh position={wallPosition} rotation={[0, -angle, 0]}>
                <boxGeometry args={[length, wallHeight, wallThickness]} />
                <meshStandardMaterial map={outWallTexture} />
              </mesh>
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
