import React, { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface ItemCustomizationViewerProps {
  modelPath: string;
  color?: string;
  textureFile?: File | null;
}

interface ModelViewerProps {
  modelPath: string;
  color?: string;
  textureFile?: File | null;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  color,
  textureFile,
}) => {
  const { scene } = useGLTF(modelPath);
  const [modifiedScene, setModifiedScene] = useState<THREE.Group>();

  useEffect(() => {
    if (color || textureFile) {
      const clone = scene.clone(true);
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (textureFile) {
            const textureUrl = URL.createObjectURL(textureFile);
            const loader = new THREE.TextureLoader();
            loader.load(textureUrl, (loadedTexture) => {
              child.material = new THREE.MeshStandardMaterial({
                map: loadedTexture,
              });
            });
          } else if (color) {
            child.material = new THREE.MeshStandardMaterial({ color });
          }
        }
      });
      setModifiedScene(clone);
    }
  }, [scene, color, textureFile]);

  return (
    <group>
      <primitive object={modifiedScene || scene} />
    </group>
  );
};

const ItemCustomizationViewer: React.FC<ItemCustomizationViewerProps> = ({
  modelPath,
  color,
  textureFile,
}) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <OrbitControls
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        rotateSpeed={1}
        zoomSpeed={1.2}
        panSpeed={0.8}
      />
      <ModelViewer
        modelPath={modelPath}
        color={color}
        textureFile={textureFile}
      />
    </Canvas>
  );
};

export default ItemCustomizationViewer;
