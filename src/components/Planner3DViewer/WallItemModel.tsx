import React, { useEffect, useMemo, forwardRef, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Mesh, Object3D, Vector3 } from "three";

export interface ItemModelProps {
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
    const { scene } = useGLTF(`${path}`);
    const modelRef = useRef<Object3D | null>(null);

    // Calculate initial bounding box data from the original scene
    const initialBounds = useMemo(() => {
      const bbox = new Box3().setFromObject(scene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);
      return { size, center };
    }, [scene]);

    // Clone the scene to avoid mutating the original
    const clonedScene = useMemo(() => {
      return scene.clone(true);
    }, [scene]);

    const [adjustedScale, adjustedPosition] = useMemo(() => {
      const { size, center } = initialBounds;

      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      const adjustedScale: [number, number, number] = [scaleX, scaleY, scaleZ];

      const adjustedPosition: [number, number, number] = [
        position[0] - center.x * scaleX,
        position[1] - center.y * scaleY + dimensions.height / 2,
        position[2] - center.z * scaleZ,
      ];

      return [adjustedScale, adjustedPosition];
    }, [initialBounds, dimensions, position]);

    // Position and scale the model once it's mounted
    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.position.set(...adjustedPosition);
        modelRef.current.scale.set(...adjustedScale);
      }
    }, [adjustedPosition, adjustedScale]);

    // Clean up cloned scene geometry/materials on unmount
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

    return (
      <>
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
      </>
    );
  },
);

ItemModel.displayName = "ItemModel";

export default ItemModel;
