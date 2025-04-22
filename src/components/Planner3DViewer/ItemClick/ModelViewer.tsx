import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Customization, SelectionType } from "../Modal/ItemCustomizationViewer";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { adjustBrightness, findTopmostNamedNode } from "./ModelUtils";

interface ModelViewerProps {
  modelPath: string;
  customizations: Record<string, Customization>;
  selectedGroups: SelectionType[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<SelectionType[]>>;
  onSceneReady?: (scene: THREE.Object3D) => void;
}

export interface ModelViewerHandle {
  applyTranslation: (translation: { x: number; y: number; z: number }) => void;
  applyRotation: (rotation: { x: number; y: number; z: number }) => void;
  removeSelectedGroups: () => void;
}

const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(
  (
    {
      modelPath,
      customizations,
      selectedGroups,
      setSelectedGroups,
      onSceneReady,
    },
    ref,
  ) => {
    const { scene } = useGLTF(modelPath);
    const { raycaster, camera, gl } = useThree();

    const [highlightBoxes, setHighlightBoxes] = useState<THREE.BoxHelper[]>([]);

    const isInitialRender = useRef(true);
    const prevCustomizations = useRef(customizations);

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

    const [sceneObjects, setSceneObjects] = useState<
      Map<string, THREE.Object3D>
    >(new Map());

    const applyTranslation = (translation: {
      x: number;
      y: number;
      z: number;
    }) => {
      const newScene = modifiedScene.clone(true);
      selectedGroups.forEach((sel) => {
        const groupObj = newScene.getObjectByName(sel.groupName);
        if (groupObj) {
          groupObj.position.x += translation.x;
          groupObj.position.y += translation.y;
          groupObj.position.z += translation.z;
        }
      });
      setModifiedScene(newScene);
    };

    const applyRotation = (rotation: { x: number; y: number; z: number }) => {
      const newScene = modifiedScene.clone(true);
      selectedGroups.forEach((sel) => {
        const groupObj = newScene.getObjectByName(sel.groupName);
        if (groupObj) {
          groupObj.rotation.x += (rotation.x * Math.PI) / 180;
          groupObj.rotation.y += (rotation.y * Math.PI) / 180;
          groupObj.rotation.z += (rotation.z * Math.PI) / 180;
        }
      });
      setModifiedScene(newScene);
    };

    const removeSelectedGroups = () => {
      const newScene = modifiedScene.clone(true);
      selectedGroups.forEach((sel) => {
        const groupObj = newScene.getObjectByName(sel.groupName);
        if (groupObj && groupObj.parent) {
          groupObj.parent.remove(groupObj);
        }
      });
      setModifiedScene(newScene);
      setSelectedGroups([]);
    };

    useEffect(() => {
      const objectMap = new Map<string, THREE.Object3D>();
      modifiedScene.traverse((object) => {
        objectMap.set(object.uuid, object);
      });
      setSceneObjects(objectMap);
    }, [modifiedScene]);

    useEffect(() => {
      if (isInitialRender.current) {
        isInitialRender.current = false;
        return;
      }

      if (prevCustomizations.current === customizations) {
        return;
      }

      prevCustomizations.current = customizations;

      const clone = modifiedScene.clone(true);

      const transformMap = new Map<
        string,
        {
          position: THREE.Vector3;
          rotation: THREE.Euler;
          scale: THREE.Vector3;
        }
      >();

      modifiedScene.traverse((object) => {
        if (object.name) {
          transformMap.set(object.name, {
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone(),
          });
        }
      });

      clone.traverse((object) => {
        if (object.name && transformMap.has(object.name)) {
          const transform = transformMap.get(object.name)!;
          object.position.copy(transform.position);
          object.rotation.copy(transform.rotation);
          object.scale.copy(transform.scale);
        }
      });

      Object.entries(customizations).forEach(([groupName, cust]) => {
        const groupObj = clone.getObjectByName(groupName);
        if (!groupObj) return;
        groupObj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const hasCustomOpacity =
              cust.opacity !== undefined && cust.opacity < 100;

            if (cust.textureFile) {
              const textureURL = URL.createObjectURL(cust.textureFile);
              const loader = new THREE.TextureLoader();
              loader.load(textureURL, (loadedTexture) => {
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;

                const scale = cust.textureScale || 1;

                const repeatX = cust.textureRepeat?.x || 1;
                const repeatY = cust.textureRepeat?.y || 1;
                loadedTexture.repeat.set(repeatX * scale, repeatY * scale);

                const offsetX = cust.textureOffset?.x || 0;
                const offsetY = cust.textureOffset?.y || 0;
                loadedTexture.offset.set(offsetX, offsetY);

                const material = new THREE.MeshStandardMaterial({
                  map: loadedTexture,
                  transparent: hasCustomOpacity,
                  opacity: hasCustomOpacity ? cust.opacity! / 100 : 1.0,
                });

                child.material = material;
              });
            } else if (cust.color) {
              const adjustedColor =
                cust.brightness !== undefined
                  ? adjustBrightness(cust.color, cust.brightness)
                  : cust.color;

              child.material = new THREE.MeshStandardMaterial({
                color: adjustedColor,
                transparent: hasCustomOpacity,
                opacity: hasCustomOpacity ? cust.opacity! / 100 : 1.0,
              });
            } else {
              const origMat = originalMaterials.get(child.uuid);
              if (origMat) {
                const clonedMat = origMat.clone();

                if (hasCustomOpacity && clonedMat instanceof THREE.Material) {
                  clonedMat.transparent = true;
                  clonedMat.opacity = cust.opacity! / 100;
                }

                child.material = clonedMat;
              }
            }
          }
        });
      });

      setModifiedScene(clone);
    }, [customizations]);

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

    useEffect(() => {
      if (onSceneReady) {
        onSceneReady(modifiedScene);
      }
    }, [modifiedScene, onSceneReady]);

    useImperativeHandle(ref, () => ({
      applyTranslation,
      applyRotation,
      removeSelectedGroups,
    }));

    return (
      <group>
        <primitive object={modifiedScene} />
        {highlightBoxes.map((box, index) => (
          <primitive object={box} key={index} />
        ))}
      </group>
    );
  },
);

ModelViewer.displayName = "ModelViewer";

export default ModelViewer;
