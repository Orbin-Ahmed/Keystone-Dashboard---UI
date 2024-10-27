import React, { useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Mesh, Vector3 } from "three";

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

const Model = ({
  path,
  position,
  rotation,
  type,
  wallThickness,
  wallHeight,
  doorDimensions,
  windowDimensions,
}: ModelProps) => {
  const { scene } = useGLTF(`/models/${path}`);
  const [adjustedPosition, setAdjustedPosition] =
    useState<[number, number, number]>(position);
  const [adjustedScale, setAdjustedScale] = useState<[number, number, number]>([
    1, 1, 1,
  ]);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (scene) {
      const bbox = new Box3().setFromObject(scene);
      const size = new Vector3();
      bbox.getSize(size);
      const center = new Vector3();
      bbox.getCenter(center);
      const { width: doorWidth, height: doorHeight } = doorDimensions;
      const { width: windowWidth, height: windowHeight } = windowDimensions;

      const scaleX = (type === "door" ? doorWidth : windowWidth) / size.x;
      const scaleY = (type === "door" ? doorHeight : windowHeight) / size.y;
      const scaleZ = wallThickness / size.z;

      setAdjustedScale([scaleX, scaleY, scaleZ]);
      let adjustedLocalX = position[0] - center.x * scaleX;
      let adjustedLocalY = position[1] - center.y * scaleY;
      let adjustedLocalZ = position[2] - center.z * scaleZ;

      setAdjustedPosition([adjustedLocalX, adjustedLocalY, adjustedLocalZ]);
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
  }, [
    clonedScene,
    type,
    doorDimensions,
    windowDimensions,
    wallThickness,
    wallHeight,
    position,
  ]);

  return (
    <primitive
      object={clonedScene}
      position={adjustedPosition}
      rotation={rotation}
      scale={adjustedScale}
    />
  );
};

export default Model;
