import { useEffect } from "react";
import { SelectionType } from "../Modal/ItemCustomizationViewer";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { findTopmostNamedNode } from "./ModelViewer";

interface SceneClickHandlerProps {
  children: React.ReactNode;
  selectedGroups: SelectionType[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<SelectionType[]>>;
}

const SceneClickHandler: React.FC<SceneClickHandlerProps> = ({
  children,
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

export default SceneClickHandler;
