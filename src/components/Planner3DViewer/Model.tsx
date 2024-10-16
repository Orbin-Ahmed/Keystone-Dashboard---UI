import React, { useState, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3, Group, Mesh } from "three";

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
  const [object, setObject] = useState<Group | Mesh | null>(null);
  const extension = path.split(".").pop()?.toLowerCase();

  // Load either OBJ or GLB using the appropriate loader
  const objObject =
    extension === "obj" ? useLoader(OBJLoader, `/models/${path}`) : null;
  const gltf =
    extension === "glb" || extension === "gltf"
      ? useGLTF(`/models/${path}`)
      : null;

  useEffect(() => {
    let loadedObject: Group | Mesh | null = null;

    if (objObject) {
      loadedObject = objObject;
    } else if (gltf) {
      loadedObject = gltf.scene;
    }

    if (loadedObject) {
      setObject(loadedObject);

      // Calculate dimensions and center
      const bbox = new Box3().setFromObject(loadedObject);
      const size = new Vector3();
      bbox.getSize(size);
      const center = new Vector3();
      bbox.getCenter(center);

      if (onLoaded) {
        onLoaded({
          dimensions: { width: size.x, height: size.y, depth: size.z },
          center,
        });
      }
    }
  }, [objObject, gltf, onLoaded]);

  if (!object) {
    return null; // or a loading placeholder
  }

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
