import React, { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface Customization {
  color?: string;
  textureFile?: File;
}

export interface ItemCustomizationViewerProps {
  modelPath: string;
  customizations?: Record<string, Customization>;
  selectedMesh?: string | null;
  onMeshSelected?: (uuid: string) => void;
}

interface ModelViewerProps {
  modelPath: string;
  customizations?: Record<string, Customization>;
  selectedMesh?: string | null;
  onMeshSelected?: (uuid: string) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  customizations,
  selectedMesh,
  onMeshSelected,
}) => {
  const { scene } = useGLTF(modelPath);

  const originalMaterials = useMemo(() => {
    const materials = new Map<string, THREE.Material>();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        materials.set(child.uuid, child.material.clone());
      }
    });
    return materials;
  }, [scene]);

  const [modifiedScene, setModifiedScene] = useState<THREE.Group>();
  useEffect(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const cust = customizations ? customizations[child.uuid] : undefined;
        if (cust) {
          if (cust.textureFile) {
            const textureUrl = URL.createObjectURL(cust.textureFile);
            const loader = new THREE.TextureLoader();
            loader.load(textureUrl, (loadedTexture) => {
              child.material = new THREE.MeshStandardMaterial({
                map: loadedTexture,
              });
            });
          } else if (cust.color) {
            child.material = new THREE.MeshStandardMaterial({
              color: cust.color,
            });
          }
        } else {
          const orig = originalMaterials.get(child.uuid);
          if (orig) {
            child.material = orig.clone();
          }
        }
      }
    });
    setModifiedScene(clone);
  }, [scene, customizations, originalMaterials]);

  const [boxHelper, setBoxHelper] = useState<THREE.BoxHelper | null>(null);
  useEffect(() => {
    if (modifiedScene && selectedMesh) {
      const found = modifiedScene.getObjectByProperty("uuid", selectedMesh);
      if (found) {
        const helper = new THREE.BoxHelper(found, "red");
        setBoxHelper(helper);
      } else {
        setBoxHelper(null);
      }
    } else {
      setBoxHelper(null);
    }
  }, [modifiedScene, selectedMesh]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.intersections && e.intersections.length > 0) {
      const clicked = e.intersections[0].object;
      if (clicked && onMeshSelected) {
        onMeshSelected(clicked.uuid);
      }
    }
  };

  return (
    <group onPointerDown={handlePointerDown}>
      <primitive object={modifiedScene || scene} />
      {boxHelper && <primitive object={boxHelper} />}
    </group>
  );
};

const ItemCustomizationViewer: React.FC<ItemCustomizationViewerProps> = ({
  modelPath,
  customizations,
  selectedMesh,
  onMeshSelected,
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
        customizations={customizations}
        selectedMesh={selectedMesh}
        onMeshSelected={onMeshSelected}
      />
    </Canvas>
  );
};

export default ItemCustomizationViewer;
