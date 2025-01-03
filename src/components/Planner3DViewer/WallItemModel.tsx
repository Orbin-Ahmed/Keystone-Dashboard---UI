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
    const { scene, camera } = useThree();
    const { scene: model } = useGLTF(`/models/${path}`);
    const modelRef = useRef<Object3D | null>(null);
    const [isColliding, setIsColliding] = useState(false);
    const raycaster = useMemo(() => new Raycaster(), []);

    const initialBounds = useMemo(() => {
      const bbox = new Box3().setFromObject(scene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);
      return { size, center };
    }, [scene]);

    const [adjustedScale, adjustedPosition] = useMemo(() => {
      const { size, center } = initialBounds;

      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      const adjustedScale: [number, number, number] = [scaleX, scaleY, scaleZ];

      const wallOffset = wallNormal
        ? wallNormal.multiplyScalar(0.01)
        : new Vector3();

      const adjustedPosition: [number, number, number] = [
        position[0] - center.x * scaleX + wallOffset.x,
        position[1] - center.y * scaleY + dimensions.height / 2 + wallOffset.y,
        position[2] - center.z * scaleZ + wallOffset.z,
      ];

      return [adjustedScale, adjustedPosition];
    }, [initialBounds, dimensions, position, wallNormal]);

    useEffect(() => {
      if (modelRef.current && wallNormal) {
        const upVector = new Vector3(0, 1, 0);
        modelRef.current.lookAt(wallNormal);
        modelRef.current.rotateY(Math.PI);
      }
    }, [wallNormal]);

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
        object={model.clone()}
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
    );
  },
);

WallItemModel.displayName = "WallItemModel";

export default WallItemModel;
