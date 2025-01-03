import React, { useEffect, useMemo, forwardRef, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Object3D, Vector3, Plane, Box3 } from "three";
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

    const [adjustedScale] = useMemo(() => {
      const { size } = initialBounds;
      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      const adjustedScale: [number, number, number] = [scaleX, scaleY, scaleZ];

      return [adjustedScale];
    }, [initialBounds, dimensions]);

    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.scale.set(...adjustedScale);
        modelRef.current.position.set(
          -initialBounds.center.x * adjustedScale[0],
          -initialBounds.center.y * adjustedScale[1],
          -initialBounds.center.z * adjustedScale[2],
        );

        modelRef.current.position.add(new Vector3(...position));
        modelRef.current.rotation.y = rotation[1];
      }
    }, [modelRef, adjustedScale, position, initialBounds, rotation]);

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
