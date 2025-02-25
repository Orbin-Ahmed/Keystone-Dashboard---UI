import React, { useMemo, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface Customization {
  color?: string;
  brightness?: number; // 0-100, replaces opacity - controls light/dark
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

// Improved function to find the topmost named node
function findTopmostNamedNode(mesh: THREE.Object3D): THREE.Object3D | null {
  if (!mesh) return null;

  // Start with the clicked object
  let current: THREE.Object3D | null = mesh;
  let parent = current.parent;

  // If the mesh itself has a name, use it
  if (current.name && current.name !== "") {
    return current;
  }

  // Walk up the hierarchy to find the first ancestor with a name
  while (parent && parent.type !== "Scene") {
    if (parent.name && parent.name !== "") {
      return parent;
    }
    current = parent;
    parent = current.parent;
  }

  // If no named parent was found, return the original mesh
  return mesh;
}

// Helper to adjust color brightness
function adjustBrightness(hexColor: string, brightness: number): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Map brightness from 0-100 to -1 to 1 scale
  // 50 is neutral, below 50 darkens, above 50 lightens
  const factor = (brightness - 50) / 50;

  // Adjust RGB values
  const adjustColor = (color: number, factor: number): number => {
    if (factor >= 0) {
      // Lighten: scale towards white (255)
      return Math.min(255, Math.round(color + (255 - color) * factor));
    } else {
      // Darken: scale towards black (0)
      return Math.max(0, Math.round(color * (1 + factor)));
    }
  };

  const newR = adjustColor(r, factor);
  const newG = adjustColor(g, factor);
  const newB = adjustColor(b, factor);

  // Convert back to hex
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

  // Create a mapping of all objects in the scene for faster lookups
  const [sceneObjects, setSceneObjects] = useState<Map<string, THREE.Object3D>>(
    new Map(),
  );

  // Set up the scene objects map
  useEffect(() => {
    const objectMap = new Map<string, THREE.Object3D>();
    modifiedScene.traverse((object) => {
      objectMap.set(object.uuid, object);
    });
    setSceneObjects(objectMap);
  }, [modifiedScene]);

  // Effect to apply customizations
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
            // Apply color with brightness adjustment
            const adjustedColor =
              cust.brightness !== undefined
                ? adjustBrightness(cust.color, cust.brightness)
                : cust.color;

            child.material = new THREE.MeshStandardMaterial({
              color: adjustedColor,
              transparent: false, // No transparency
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

  // Create a BoxHelper for each selected group
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

  // Improved direct selection handler - using mouse position directly
  const handleClick = (event: React.MouseEvent) => {
    // Get mouse coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(modifiedScene.children, true);

    // If no intersections, clear selection
    if (intersects.length === 0) {
      setSelectedGroups([]);
      return;
    }

    // Get the first intersection
    const intersection = intersects[0];
    const clickedMesh = intersection.object;

    // Find the parent group
    const groupRoot = findTopmostNamedNode(clickedMesh);
    if (!groupRoot) return;

    // Ensure the found group contains at least one mesh
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

    // Use Ctrl/Meta key for multi-select
    if (event.ctrlKey || event.metaKey) {
      setSelectedGroups((prev) => {
        // Check if already selected - if so, remove it (toggle behavior)
        const existingIndex = prev.findIndex(
          (s) => s.groupName === newSelection.groupName,
        );
        if (existingIndex >= 0) {
          const newSelections = [...prev];
          newSelections.splice(existingIndex, 1);
          return newSelections;
        }
        // Otherwise add to selection
        return [...prev, newSelection];
      });
    } else {
      // Replace selection with the new group
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

  // Canvas reference to attach click handler
  const canvasRef = React.useRef<HTMLDivElement>(null);

  // Simple click handler that passes the click to the canvas
  const handleCanvasClick = (event: React.MouseEvent) => {
    // Clicks on canvas elements will be handled by ModelViewer now
  };

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full"
      onClick={handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ touchAction: "none" }} // Helps with mobile interactions
        dpr={[1, 2]} // For better rendering on high density displays
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

// New component to handle clicks properly in the scene
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

  // Event handler for pointer down
  const handlePointerDown = (event: any) => {
    // Get normalized mouse coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Setup raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // Get all meshes in the scene
    const meshes: THREE.Object3D[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object);
      }
    });

    // Find intersections
    const intersects = raycaster.intersectObjects(meshes, false);

    // Clear selection if clicking on empty space
    if (intersects.length === 0) {
      setSelectedGroups([]);
      return;
    }

    // Get the first intersection
    const intersection = intersects[0];
    const clickedMesh = intersection.object;

    // Find the parent group
    const groupRoot = findTopmostNamedNode(clickedMesh);
    if (!groupRoot) return;

    // Ensure the found group contains at least one mesh
    const groupMeshes: string[] = [];
    groupRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        groupMeshes.push(child.uuid);
      }
    });

    if (groupMeshes.length === 0) return;

    // Create the new selection
    const newSelection: SelectionType = {
      groupName: groupRoot.name || groupRoot.uuid,
      meshes: groupMeshes,
    };

    // Handle selection logic with Ctrl/Meta key for multi-select
    if (event.ctrlKey || event.metaKey) {
      setSelectedGroups((prev) => {
        // Toggle behavior: remove if already selected
        const existingIndex = prev.findIndex(
          (s) => s.groupName === newSelection.groupName,
        );
        if (existingIndex >= 0) {
          const newSelections = [...prev];
          newSelections.splice(existingIndex, 1);
          return newSelections;
        }
        // Otherwise add to selection
        return [...prev, newSelection];
      });
    } else {
      // Replace selection with the new group
      setSelectedGroups([newSelection]);
    }
  };

  // Add event listener to the DOM element
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
