import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";
import { useEffect, useState } from "react";
import { Box3, Vector3 } from "three";

const Model = ({
  path,
  position,
  rotation,
  scale,
  onLoaded,
}: {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  onLoaded?: (modelData: {
    dimensions: { width: number; height: number; depth: number };
    center: Vector3;
  }) => void;
}) => {
  const object = useLoader(OBJLoader, path, (loader) => {
    loader.setPath("/models/");
  });

  useEffect(() => {
    if (object && onLoaded) {
      const bbox = new Box3().setFromObject(object);
      const size = new Vector3();
      bbox.getSize(size);
      const center = new Vector3();
      bbox.getCenter(center);
      // console.log(center);

      onLoaded({
        dimensions: { width: size.x, height: size.y, depth: size.z },
        center,
      });
    }
  }, [object]);

  return (
    <primitive
      object={object.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

export default Model;
