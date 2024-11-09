import React, { useEffect, useMemo, forwardRef, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Mesh, Object3D, Vector3 } from "three";

interface ItemModelProps {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

const ItemModel = forwardRef<Object3D, ItemModelProps>(
  ({ path, position, rotation, dimensions }, ref) => {
    const { scene } = useGLTF(`/models/${path}`);
    const modelRef = useRef<Object3D | null>(null);

    const initialBounds = useMemo(() => {
      const bbox = new Box3().setFromObject(scene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);
      return { size, center };
    }, [scene]);

    const clonedScene = useMemo(() => {
      return scene.clone(true);
    }, [scene]);

    const [adjustedPosition, adjustedScale] = useMemo(() => {
      const { size, center } = initialBounds;

      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      const adjustedLocalX = position[0] - center.x * scaleX;
      const adjustedLocalY =
        position[1] - center.y * scaleY + dimensions.height / 2;
      const adjustedLocalZ = position[2] - center.z * scaleZ;

      return [
        [adjustedLocalX, adjustedLocalY, adjustedLocalZ] as [
          number,
          number,
          number,
        ],
        [scaleX, scaleY, scaleZ] as [number, number, number],
      ];
    }, [initialBounds, dimensions, position]);

    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.position.set(...adjustedPosition);
        modelRef.current.scale.set(...adjustedScale);
        modelRef.current.rotation.set(...rotation);
      }
    }, [adjustedPosition, adjustedScale, rotation]);

    useEffect(() => {
      const currentScene = clonedScene;

      return () => {
        currentScene.traverse((object) => {
          if (object instanceof Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material?.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
      };
    }, [clonedScene]);

    useEffect(() => {
      useGLTF.preload(`/models/${path}`);
      return () => {
        useGLTF.clear(`/models/${path}`);
      };
    }, [path]);

    return (
      <primitive
        ref={(obj: Object3D | null) => {
          modelRef.current = obj;
          if (typeof ref === "function") {
            ref(obj);
          } else if (ref) {
            (ref as React.MutableRefObject<Object3D | null>).current = obj;
          }
        }}
        object={clonedScene}
        position={adjustedPosition}
        rotation={rotation}
        scale={adjustedScale}
      />
    );
  },
);

ItemModel.displayName = "ItemModel";

export default ItemModel;
