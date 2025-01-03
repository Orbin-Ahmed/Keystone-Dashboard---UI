// WallItemModel.tsx
import React, { useEffect, useMemo, forwardRef, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Object3D, Vector3, Raycaster, Plane, Box3 } from "three";
import { useThree } from "@react-three/fiber";
import { ItemModelProps } from "./ItemModel";

interface WallItemModelProps extends ItemModelProps {
  wallNormal?: Vector3;
  wallPlane?: Plane;
}

const WallItemModel = forwardRef<Object3D, WallItemModelProps>(
  (
    {
      path,
      position,
      rotation,
      dimensions,
      wallBoundingBoxes,
      wallNormal,
      wallPlane,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerOver,
      onPointerOut,
      onClick,
    },
    ref,
  ) => {
    const { scene: modelScene } = useGLTF(`/models/${path}`);
    const modelRef = useRef<Object3D | null>(null);

    const initialBounds = useMemo(() => {
      const bbox = new Box3().setFromObject(modelScene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);
      return { size, center };
    }, [modelScene]);

    const [adjustedScale, adjustedPosition] = useMemo(() => {
      const { size, center } = initialBounds;
      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      const adjustedScale: [number, number, number] = [scaleX, scaleY, scaleZ];

      const wallOffset = wallNormal
        ? wallNormal
            .clone()
            .multiplyScalar(wallBoundingBoxes.length > 0 ? 3 : 0.1)
        : new Vector3();

      const adjustedPosition: [number, number, number] = [
        position[0] + wallOffset.x,
        position[1] + wallOffset.y,
        position[2] + wallOffset.z,
      ];

      return [adjustedScale, adjustedPosition];
    }, [initialBounds, dimensions, position, wallNormal, wallBoundingBoxes]);

    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.scale.set(...adjustedScale);
        modelRef.current.position.set(
          -initialBounds.center.x * adjustedScale[0],
          -initialBounds.center.y * adjustedScale[1],
          -initialBounds.center.z * adjustedScale[2],
        );

        modelRef.current.position.add(new Vector3(...adjustedPosition));

        if (wallNormal) {
          modelRef.current.lookAt(
            new Vector3(
              modelRef.current.position.x + wallNormal.x,
              modelRef.current.position.y + wallNormal.y,
              modelRef.current.position.z + wallNormal.z,
            ),
          );
        }
      }
    }, [modelRef, adjustedScale, adjustedPosition, initialBounds, wallNormal]);

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
        rotation={rotation}
        object={modelScene.clone()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
    );
  },
);

WallItemModel.displayName = "WallItemModel";

export default WallItemModel;
