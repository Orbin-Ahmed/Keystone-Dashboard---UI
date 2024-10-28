import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Material, Mesh, MeshStandardMaterial, Vector3 } from "three";

interface ModelProps {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  type: "door" | "window";
  wallThickness: number;
  wallHeight: number;
  doorDimensions: { width: number; height: number };
  windowDimensions: { width: number; height: number };
}

interface Dimensions {
  width: number;
  height: number;
}

const Model: React.FC<ModelProps> = React.memo(
  ({
    path,
    position,
    rotation,
    type,
    wallThickness,
    wallHeight,
    doorDimensions,
    windowDimensions,
  }) => {
    const { scene, materials } = useGLTF(`/models/${path}`);
    const sceneRef = useRef(null);

    // Memoize dimensions based on type
    const dimensions = useMemo<Dimensions>(
      () => (type === "door" ? doorDimensions : windowDimensions),
      [type, doorDimensions, windowDimensions],
    );

    // Memoize material cloning function
    const cloneMaterial = useCallback((material: Material) => {
      const newMat = material.clone();
      if (newMat instanceof MeshStandardMaterial) {
        newMat.metalness = 0.5;
      }
      return newMat;
    }, []);

    // Memoize scene cloning with optimized material handling
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

    // Memoize position and scale calculations
    const [adjustedPosition, adjustedScale] = useMemo(() => {
      const bbox = new Box3().setFromObject(scene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);

      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
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

    // Cleanup resources
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

    // Preload next model
    useEffect(() => {
      return () => {
        useGLTF.preload(`/models/${path}`);
      };
    }, [path]);

    return (
      <primitive
        ref={sceneRef}
        object={clonedScene}
        position={adjustedPosition}
        rotation={rotation}
        scale={adjustedScale}
      />
    );
  },
);

Model.displayName = "Model";

// Preload model
export const preloadModel = (path: string) => {
  useGLTF.preload(`/models/${path}`);
};

export default Model;
