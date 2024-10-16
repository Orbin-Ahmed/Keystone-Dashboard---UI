import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

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

  useEffect(() => {
    if (scene && onLoaded) {
      // Calculate dimensions and center
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
  }, [scene, onLoaded]);

  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

export default Model;
