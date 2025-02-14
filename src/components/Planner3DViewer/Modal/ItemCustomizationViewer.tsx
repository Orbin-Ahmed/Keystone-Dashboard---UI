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

const DEFAULT_COLOR = "#ffffff";

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  color,
  textureFile,
}) => {
  const { scene } = useGLTF(modelPath);
  const [modifiedScene, setModifiedScene] = useState<THREE.Group>();
  const originalMaterials = useMemo(() => {
    const materials = new Map<string, THREE.Material>();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        materials.set(child.uuid, child.material.clone());
      }
    });
    return materials;
  }, [scene]);

  useEffect(() => {
    if (textureFile || (color && color !== DEFAULT_COLOR)) {
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
          } else if (color && color !== DEFAULT_COLOR) {
            child.material = new THREE.MeshStandardMaterial({ color });
          }
        }
      });
      setModifiedScene(clone);
    } else {
      const clone = scene.clone(true);
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const originalMaterial = originalMaterials.get(child.uuid);
          if (originalMaterial) {
            child.material = originalMaterial.clone();
          }
        }
      });
      setModifiedScene(clone);
    }
  }, [scene, color, textureFile, originalMaterials]);

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
      <spotLight position={[-10, -10, -10]} intensity={0.5} />
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
