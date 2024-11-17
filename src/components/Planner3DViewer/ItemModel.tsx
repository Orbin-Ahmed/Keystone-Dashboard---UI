import React, { useEffect, useMemo, forwardRef, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import { ThreeEvent } from "@react-three/fiber";

interface ItemModelProps {
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  wallBoundingBoxes: Box3[];
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

const ItemModel = forwardRef<Object3D, ItemModelProps>(
  (
    {
      path,
      position,
      rotation,
      dimensions,
      wallBoundingBoxes,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerOver,
      onPointerOut,
      onClick,
    },
    ref,
  ) => {
    const { scene } = useGLTF(`/models/${path}`);
    const modelRef = useRef<Object3D | null>(null);
    const [isColliding, setIsColliding] = useState(false);
    const originalMaterials = useRef<Material[]>([]);

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

    const [adjustedScale, adjustedPosition] = useMemo(() => {
      const { size, center } = initialBounds;

      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      const adjustedScale: [number, number, number] = [scaleX, scaleY, scaleZ];

      const adjustedPosition: [number, number, number] = [
        position[0] - center.x,
        position[1] - center.y * scaleY + dimensions.height / 2,
        position[2] - center.z,
      ];

      return [adjustedScale, adjustedPosition];
    }, [initialBounds, dimensions, position]);

    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.position.set(...adjustedPosition);
        modelRef.current.scale.set(...adjustedScale);
      }
    }, [adjustedPosition, adjustedScale]);

    useEffect(() => {
      if (modelRef.current) {
        const materials: Material[] = [];
        modelRef.current.traverse((child) => {
          if (child instanceof Mesh) {
            if (Array.isArray(child.material)) {
              materials.push(...child.material);
            } else {
              materials.push(child.material);
            }
          }
        });
        originalMaterials.current = materials;
      }
    }, []);

    useEffect(() => {
      if (modelRef.current) {
        const itemBox = new Box3().setFromObject(modelRef.current);

        let collisionDetected = false;
        for (const wallBox of wallBoundingBoxes) {
          if (itemBox.intersectsBox(wallBox)) {
            collisionDetected = true;
            break;
          }
        }
        setIsColliding(collisionDetected);
      }
    }, [position, wallBoundingBoxes]);

    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof Mesh) {
            if (isColliding) {
              child.material = new MeshStandardMaterial({ color: "red" });
            } else {
              // Restore original material
              const index = originalMaterials.current.indexOf(child.material);
              if (index !== -1) {
                child.material = originalMaterials.current[index];
              }
            }
          }
        });
      }
    }, [isColliding]);

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

ItemModel.displayName = "ItemModel";

export default ItemModel;
