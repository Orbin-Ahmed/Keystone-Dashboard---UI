import React, { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Mesh, Vector3 } from "three";

interface ModelProps {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  onLoaded?: (modelData: {
    dimensions: { width: number; height: number; depth: number };
    center: Vector3;
  }) => void;
}

const Model = ({ path, position, rotation, scale, onLoaded }: ModelProps) => {
  const { scene } = useGLTF(`/models/${path}`);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (scene && onLoaded) {
      const bbox = new Box3().setFromObject(scene);
      const size = new Vector3();
      bbox.getSize(size);
      const center = new Vector3();
      bbox.getCenter(center);

      onLoaded({
        dimensions: { width: size.x, height: size.y, depth: size.z },
        center,
      });
    }
    return () => {
      clonedScene.traverse((object) => {
        if (object instanceof Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [clonedScene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

export default Model;
