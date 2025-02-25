import React, { useMemo, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface Customization {
  color?: string;
  brightness?: number;
  textureFile?: File;
}

export interface SelectionType {
  groupName: string;
  meshes: string[];
}

export interface ItemCustomizationViewerProps {
  modelPath: string;
  customizations?: Record<string, Customization>;
  selectedGroups?: SelectionType[];
  setSelectedGroups?: React.Dispatch<React.SetStateAction<SelectionType[]>>;
  onApplyCustomizations?: (c: Record<string, Customization>) => void;
  onSceneReady?: (scene: THREE.Object3D) => void;
}

function findTopmostNamedNode(mesh: THREE.Object3D): THREE.Object3D | null {
  if (!mesh) return null;

  let current: THREE.Object3D | null = mesh;
  let parent = current.parent;

  if (current.name && current.name !== "") {
    return current;
  }

  while (parent && parent.type !== "Scene") {
    if (parent.name && parent.name !== "") {
      return parent;
    }
    current = parent;
    parent = current.parent;
  }

  return mesh;
}

function adjustBrightness(hexColor: string, brightness: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const factor = (brightness - 50) / 50;

  const adjustColor = (color: number, factor: number): number => {
    if (factor >= 0) {
      return Math.min(255, Math.round(color + (255 - color) * factor));
    } else {
      return Math.max(0, Math.round(color * (1 + factor)));
    }
  };

  const newR = adjustColor(r, factor);
  const newG = adjustColor(g, factor);
  const newB = adjustColor(b, factor);
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

interface ModelViewerProps {
  modelPath: string;
  customizations: Record<string, Customization>;
  selectedGroups: SelectionType[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<SelectionType[]>>;
  onSceneReady?: (scene: THREE.Object3D) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  customizations,
  selectedGroups,
  setSelectedGroups,
  onSceneReady,
}) => {
  const { scene } = useGLTF(modelPath);
  const { raycaster, camera, gl } = useThree();

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

  const [sceneObjects, setSceneObjects] = useState<Map<string, THREE.Object3D>>(
    new Map(),
  );

  useEffect(() => {
    const objectMap = new Map<string, THREE.Object3D>();
    modifiedScene.traverse((object) => {
      objectMap.set(object.uuid, object);
    });
    setSceneObjects(objectMap);
  }, [modifiedScene]);

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
            const adjustedColor =
              cust.brightness !== undefined
                ? adjustBrightness(cust.color, cust.brightness)
                : cust.color;

            child.material = new THREE.MeshStandardMaterial({
              color: adjustedColor,
              transparent: false,
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

  const [highlightBoxes, setHighlightBoxes] = useState<THREE.BoxHelper[]>([]);
  useEffect(() => {
    if (!modifiedScene || selectedGroups.length === 0) {
      setHighlightBoxes([]);
      return;
    }
    const boxes: THREE.BoxHelper[] = [];
    selectedGroups.forEach((sel) => {
      const groupObj = modifiedScene.getObjectByName(sel.groupName);
      if (groupObj) {
        const boxHelper = new THREE.BoxHelper(groupObj, 0xff0000);
        boxes.push(boxHelper);
      }
    });
    setHighlightBoxes(boxes);
  }, [modifiedScene, selectedGroups]);

  const handleClick = (event: React.MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(modifiedScene.children, true);

    if (intersects.length === 0) {
      setSelectedGroups([]);
      return;
    }

    const intersection = intersects[0];
    const clickedMesh = intersection.object;

    const groupRoot = findTopmostNamedNode(clickedMesh);
    if (!groupRoot) return;

    const meshes: string[] = [];
    groupRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child.uuid);
      }
    });

    if (meshes.length === 0) return;

    const newSelection: SelectionType = {
      groupName: groupRoot.name || groupRoot.uuid,
      meshes,
    };

    if (event.ctrlKey || event.metaKey) {
      setSelectedGroups((prev) => {
        const existingIndex = prev.findIndex(
          (s) => s.groupName === newSelection.groupName,
        );
        if (existingIndex >= 0) {
          const newSelections = [...prev];
          newSelections.splice(existingIndex, 1);
          return newSelections;
        }
        return [...prev, newSelection];
      });
    } else {
      setSelectedGroups([newSelection]);
    }
  };

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady(modifiedScene);
    }
  }, [modifiedScene, onSceneReady]);

  return (
    <group>
      <primitive object={modifiedScene} />
      {highlightBoxes.map((box, index) => (
        <primitive object={box} key={index} />
      ))}
    </group>
  );
};

const ItemCustomizationViewer: React.FC<ItemCustomizationViewerProps> = ({
  modelPath,
  customizations = {},
  onApplyCustomizations,
  selectedGroups,
  setSelectedGroups,
  onSceneReady,
}) => {
  const [localSelection, setLocalSelection] = useState<SelectionType[]>([]);
  const finalSelectedGroups = selectedGroups ?? localSelection;
  const finalSetSelectedGroups = setSelectedGroups ?? setLocalSelection;
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const handleCanvasClick = (event: React.MouseEvent) => {};

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full"
      onClick={handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ touchAction: "none" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, -10, -10]} intensity={1} />
        <OrbitControls />
        <SceneClickHandler
          selectedGroups={finalSelectedGroups}
          setSelectedGroups={finalSetSelectedGroups}
        >
          <ModelViewer
            modelPath={modelPath}
            customizations={customizations}
            selectedGroups={finalSelectedGroups}
            setSelectedGroups={finalSetSelectedGroups}
            onSceneReady={onSceneReady}
          />
        </SceneClickHandler>
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

interface SceneClickHandlerProps {
  children: React.ReactNode;
  selectedGroups: SelectionType[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<SelectionType[]>>;
}

const SceneClickHandler: React.FC<SceneClickHandlerProps> = ({
  children,
  selectedGroups,
  setSelectedGroups,
}) => {
  const { camera, gl, scene } = useThree();
  const handlePointerDown = (event: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const meshes: THREE.Object3D[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object);
      }
    });
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) {
      setSelectedGroups([]);
      return;
    }

    const intersection = intersects[0];
    const clickedMesh = intersection.object;

    const groupRoot = findTopmostNamedNode(clickedMesh);
    if (!groupRoot) return;

    const groupMeshes: string[] = [];
    groupRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        groupMeshes.push(child.uuid);
      }
    });

    if (groupMeshes.length === 0) return;

    const newSelection: SelectionType = {
      groupName: groupRoot.name || groupRoot.uuid,
      meshes: groupMeshes,
    };

    if (event.ctrlKey || event.metaKey) {
      setSelectedGroups((prev) => {
        const existingIndex = prev.findIndex(
          (s) => s.groupName === newSelection.groupName,
        );
        if (existingIndex >= 0) {
          const newSelections = [...prev];
          newSelections.splice(existingIndex, 1);
          return newSelections;
        }
        return [...prev, newSelection];
      });
    } else {
      setSelectedGroups([newSelection]);
    }
  };

  useEffect(() => {
    const domElement = gl.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);

    return () => {
      domElement.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [gl, handlePointerDown]);

  return <>{children}</>;
};

export default ItemCustomizationViewer;
