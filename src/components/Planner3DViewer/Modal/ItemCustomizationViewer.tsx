import React, { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface Customization {
  color?: string;
  textureFile?: File;
}

interface SelectionType {
  groupName: string;
  meshes: string[];
}

interface ItemCustomizationViewerProps {
  modelPath: string;
  customizations?: Record<string, Customization>;
  selectedGroup?: SelectionType | null;
  setSelectedGroup?: React.Dispatch<React.SetStateAction<SelectionType | null>>;
  onApplyCustomizations?: (c: Record<string, Customization>) => void;
}

function findTopmostNamedNode(mesh: THREE.Object3D) {
  let current: THREE.Object3D | null = mesh;
  while (current && current.parent && current.parent.type !== "Scene") {
    if (current.parent.name) {
      current = current.parent;
    } else {
      break;
    }
  }
  return current;
}

interface ModelViewerProps {
  modelPath: string;
  customizations: Record<string, Customization>;
  selectedGroup: SelectionType | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<SelectionType | null>>;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  customizations,
  selectedGroup,
  setSelectedGroup,
}) => {
  const { scene } = useGLTF(modelPath);
  const originalMaterials = useMemo(() => {
    const matMap = new Map<string, THREE.Material>();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        matMap.set(child.uuid, child.material.clone());
      }
    });
    return matMap;
  }, [scene]);

  const [modifiedScene, setModifiedScene] = useState<THREE.Group>(() =>
    scene.clone(true),
  );

  useEffect(() => {
    const clone = scene.clone(true);

    Object.entries(customizations).forEach(([groupName, cust]) => {
      const groupObj = clone.getObjectByName(groupName);
      if (!groupObj) return;

      groupObj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (cust.textureFile) {
            const textureURL = URL.createObjectURL(cust.textureFile);
            const loader = new THREE.TextureLoader();
            loader.load(textureURL, (loadedTexture) => {
              child.material = new THREE.MeshStandardMaterial({
                map: loadedTexture,
              });
            });
          } else if (cust.color) {
            child.material = new THREE.MeshStandardMaterial({
              color: cust.color,
            });
          } else {
            const origMat = originalMaterials.get(child.uuid);
            if (origMat) {
              child.material = origMat.clone();
            }
          }
        }
      });
    });

    setModifiedScene(clone);
  }, [scene, customizations, originalMaterials]);

  const [highlightBox, setHighlightBox] = useState<THREE.BoxHelper | null>(
    null,
  );

  useEffect(() => {
    if (!modifiedScene || !selectedGroup) {
      setHighlightBox(null);
      return;
    }
    const groupObj = modifiedScene.getObjectByName(selectedGroup.groupName);
    if (!groupObj) {
      setHighlightBox(null);
      return;
    }
    const boxHelper = new THREE.BoxHelper(groupObj, 0xff0000);
    setHighlightBox(boxHelper);
  }, [modifiedScene, selectedGroup]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.intersections && e.intersections.length > 0) {
      const clickedMesh = e.intersections[0].object as THREE.Mesh;
      if (!clickedMesh) return;

      const groupRoot = findTopmostNamedNode(clickedMesh);
      if (!groupRoot) return;

      const meshes: string[] = [];
      groupRoot.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child.uuid);
        }
      });

      setSelectedGroup({
        groupName: groupRoot.name || groupRoot.uuid,
        meshes,
      });
    }
  };

  return (
    <group onPointerDown={handlePointerDown}>
      <primitive object={modifiedScene} />
      {highlightBox && <primitive object={highlightBox} />}
    </group>
  );
};

const ItemCustomizationViewer: React.FC<ItemCustomizationViewerProps> = ({
  modelPath,
  customizations = {},
  onApplyCustomizations,
  selectedGroup,
  setSelectedGroup,
}) => {
  const [localSelection, setLocalSelection] = useState<SelectionType | null>(
    null,
  );

  const finalSelectedGroup = selectedGroup ?? localSelection;
  const finalSetSelectedGroup = setSelectedGroup ?? setLocalSelection;

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, -10, -10]} intensity={1} />
        <OrbitControls />

        <ModelViewer
          modelPath={modelPath}
          customizations={customizations}
          selectedGroup={finalSelectedGroup}
          setSelectedGroup={finalSetSelectedGroup}
        />
      </Canvas>
      {onApplyCustomizations && (
        <button
          className="absolute bottom-4 right-4 bg-white p-2 shadow-md"
          onClick={() => onApplyCustomizations(customizations)}
        >
          Save
        </button>
      )}
    </div>
  );
};

export default ItemCustomizationViewer;
