import React, { useEffect, useMemo, forwardRef } from "react";
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

    const clonedScene = useMemo(() => {
      const cloned = scene.clone();
      return cloned;
    }, [scene]);

    const [adjustedPosition, adjustedScale] = useMemo(() => {
      const bbox = new Box3().setFromObject(clonedScene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);

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
    }, [clonedScene, dimensions, position]);

    useEffect(() => {
      const currentScene = clonedScene;

      return () => {
        currentScene.traverse((object) => {
          if (object instanceof Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
      };
    }, [clonedScene]);

    useEffect(() => {
      return () => {
        useGLTF.clear(`/models/${path}`);
      };
    }, [path]);

    return (
      <primitive
        ref={ref}
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
