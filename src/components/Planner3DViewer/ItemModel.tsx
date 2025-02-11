import React, { useEffect, useMemo, forwardRef, useRef } from "react";
import { useGLTF, useHelper } from "@react-three/drei";
import { Box3, Mesh, Object3D, Vector3, BoxHelper } from "three";
import { ThreeEvent } from "@react-three/fiber";

export interface ItemModelProps {
  path: string;
  selected?: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

const ItemModelComponent = forwardRef<Object3D, ItemModelProps>(
  (
    {
      path,
      selected = false,
      position,
      rotation,
      dimensions,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerOver,
      onPointerOut,
      onClick,
    },
    ref,
  ) => {
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

    useHelper(
      selected ? (modelRef as React.MutableRefObject<Object3D>) : null,
      BoxHelper,
      "red",
    );

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
        <directionalLight position={[5, 10, 5]} intensity={0.2} />
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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}
        />
      </>
    );
  },
);

ItemModelComponent.displayName = "ItemModel";

export default React.memo(ItemModelComponent);
