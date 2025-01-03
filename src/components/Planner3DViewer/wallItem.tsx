import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { GLTF } from "three-stdlib";

interface WallItemProps {
  path: string;
  onPlaced?: (data: {
    position: [number, number, number];
    rotation: [number, number, number];
    normal: [number, number, number];
  }) => void;
  isActive: boolean;
  width: number;
  height: number;
  depth?: number;
  wallRefs?: React.RefObject<Object3D>[];
  onDeactivate: () => void;
}

type GLTFResult = GLTF & {
  scene: Object3D;
};

const WallItem = forwardRef<Object3D, WallItemProps>(
  (
    {
      path,
      onPlaced,
      isActive,
      width,
      height,
      depth = 0.1,
      wallRefs = [],
      onDeactivate,
    },
    ref,
  ) => {
    const { camera, gl, scene } = useThree();
    const raycaster = useMemo(() => new Raycaster(), []);
    const [hoveredWall, setHoveredWall] = useState<Object3D | null>(null);
    const gltf = useGLTF(path) as GLTFResult;
    const modelRef = useRef<Object3D | null>(null);
    const [hasPlaced, setHasPlaced] = useState(false);
    const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const initialBounds = useMemo(() => {
      const bbox = new Box3().setFromObject(clonedScene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);
      return { size, center };
    }, [clonedScene]);

    useEffect(() => {
      return () => {
        clonedScene.traverse((obj) => {
          if (obj instanceof Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material?.dispose();
            }
          }
        });
      };
    }, [clonedScene]);

    const handlePointerMove = (e: MouseEvent) => {
      if (!isActive) return;
      const mouse = new Vector2(
        (e.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.clientY / gl.domElement.clientHeight) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);

      const possibleWalls: Object3D[] = [];
      wallRefs.forEach((wRef) => {
        if (wRef.current) {
          wRef.current.traverse((child) => {
            if (child instanceof Mesh) {
              possibleWalls.push(child);
            }
          });
        }
      });

      const intersects = raycaster.intersectObjects(possibleWalls, true);

      if (intersects.length > 0) {
        const [firstHit] = intersects;
        setHoveredWall(firstHit.object);
      } else {
        setHoveredWall(null);
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      if (!isActive) return;

      const mouse = new Vector2(
        (e.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.clientY / gl.domElement.clientHeight) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);

      const possibleWalls: Object3D[] = [];
      wallRefs.forEach((wRef) => {
        if (wRef.current) {
          wRef.current.traverse((child) => {
            if (child instanceof Mesh) {
              possibleWalls.push(child);
            }
          });
        }
      });

      const intersects = raycaster.intersectObjects(possibleWalls, true);
      if (intersects.length > 0) {
        const [firstHit] = intersects;
        const hitPoint = firstHit.point.clone();
        const normal = firstHit.face?.normal.clone() ?? new Vector3(0, 0, 1);

        firstHit.object.getWorldDirection(normal);

        normal.multiplyScalar(-1);
        const offset = 0.1;
        const finalPos = hitPoint.addScaledVector(normal, offset);

        const lookAtTarget = new Vector3().addVectors(finalPos, normal);
        const finalRotation = new Vector3().copy(
          modelRef.current?.rotation || new Vector3(),
        );
        modelRef.current?.lookAt(lookAtTarget);
        finalRotation.copy(modelRef.current?.rotation ?? new Vector3());
        if (onPlaced) {
          onPlaced({
            position: [finalPos.x, finalPos.y, finalPos.z],
            rotation: [finalRotation.x, finalRotation.y, finalRotation.z],
            normal: [normal.x, normal.y, normal.z],
          });
        }

        setHasPlaced(true);
      }
    };

    useEffect(() => {
      if (isActive) {
        gl.domElement.addEventListener("pointermove", handlePointerMove);
        gl.domElement.addEventListener("pointerdown", handlePointerClick);
      }
      return () => {
        gl.domElement.removeEventListener("pointermove", handlePointerMove);
        gl.domElement.removeEventListener("pointerdown", handlePointerClick);
      };
    }, [isActive, wallRefs]);

    useEffect(() => {
      if (hasPlaced) {
        onDeactivate();
      }
    }, [hasPlaced, onDeactivate]);

    const [modelScale, modelPosition] = useMemo(() => {
      const { size, center } = initialBounds;

      const scaleX = width / size.x;
      const scaleY = height / size.y;
      const scaleZ = depth / size.z;
      const finalPos = new Vector3(
        -center.x * scaleX,
        -center.y * scaleY,
        -center.z * scaleZ,
      );

      return [
        [scaleX, scaleY, scaleZ],
        finalPos.toArray() as [number, number, number],
      ];
    }, [initialBounds, width, height, depth]);

    useFrame(() => {
      if (!hoveredWall) return;
      hoveredWall.traverse((child) => {
        if (child instanceof Mesh) {
          child.material.side = DoubleSide;
        }
      });
    });

    return (
      <group>
        {!hasPlaced && isActive && (
          <primitive
            object={clonedScene}
            ref={(node: any) => {
              modelRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<Object3D | null>).current = node;
              }
            }}
            scale={modelScale}
            position={modelPosition}
            visible={false}
          />
        )}
      </group>
    );
  },
);

WallItem.displayName = "WallItem";

export default WallItem;
