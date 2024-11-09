import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
} from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";

interface ModelProps {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  type: "door" | "window" | string;
  wallThickness?: number;
  wallHeight?: number;
  doorDimensions?: { width: number; height: number };
  windowDimensions?: { width: number; height: number };
  onClick?: () => void;
}

interface Dimensions {
  width: number;
  height: number;
}

const Model = React.memo(
  forwardRef<Object3D, ModelProps>(
    (
      {
        path,
        position,
        rotation,
        type,
        wallThickness,
        doorDimensions,
        windowDimensions,
        onClick,
      },
      ref,
    ) => {
      const { scene, materials } = useGLTF(`/models/${path}`);
      const sceneRef = useRef(null);

      const dimensions = useMemo<Dimensions>(
        () =>
          type === "door"
            ? (doorDimensions ?? { width: 50, height: 100 })
            : (windowDimensions ?? { width: 60, height: 50 }),
        [type, doorDimensions, windowDimensions],
      );

      const cloneMaterial = useCallback((material: Material) => {
        const newMat = material.clone();
        if (newMat instanceof MeshStandardMaterial) {
          newMat.metalness = 0.5;
        }
        return newMat;
      }, []);

      const clonedScene = useMemo(() => {
        const cloned = scene.clone();
        cloned.traverse((object) => {
          if (object instanceof Mesh) {
            if (Array.isArray(object.material)) {
              object.material = object.material.map((mat) =>
                mat instanceof Material ? cloneMaterial(mat) : mat,
              );
            } else if (object.material instanceof Material) {
              object.material = cloneMaterial(object.material);
            }
          }
        });
        return cloned;
      }, [scene, materials, cloneMaterial]);

      const [adjustedPosition, adjustedScale] = useMemo(() => {
        const bbox = new Box3().setFromObject(scene);
        const size = new Vector3();
        const center = new Vector3();
        bbox.getSize(size);
        bbox.getCenter(center);

        const scaleX = dimensions.width / size.x;
        const scaleY = dimensions.height / size.y;
        if (!wallThickness) {
          wallThickness = 10;
        }
        const scaleZ = wallThickness / size.z;

        const adjustedLocalX = position[0] - center.x * scaleX;
        const adjustedLocalY = position[1] - center.y * scaleY;
        const adjustedLocalZ = position[2] - center.z * scaleZ;

        return [
          [adjustedLocalX, adjustedLocalY, adjustedLocalZ] as [
            number,
            number,
            number,
          ],
          [scaleX, scaleY, scaleZ] as [number, number, number],
        ];
      }, [scene, dimensions, wallThickness, position]);

      useEffect(() => {
        const currentScene = clonedScene;

        return () => {
          currentScene.traverse((object) => {
            if (object instanceof Mesh) {
              object.geometry?.dispose();
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material?.dispose());
              } else {
                object.material?.dispose();
              }
            }
          });
        };
      }, [clonedScene]);

      useEffect(() => {
        return () => {
          useGLTF.preload(`/models/${path}`);
        };
      }, [path]);

      return (
        <primitive
          ref={ref}
          object={clonedScene}
          position={adjustedPosition}
          rotation={rotation}
          scale={adjustedScale}
          onClick={onClick}
        />
      );
    },
  ),
);

Model.displayName = "Model";

export const preloadModel = (path: string) => {
  useGLTF.preload(`/models/${path}`);
};

export default Model;
