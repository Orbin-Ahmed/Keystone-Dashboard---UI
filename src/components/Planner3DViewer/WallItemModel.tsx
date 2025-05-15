import React, { useEffect, useMemo, forwardRef, useRef, useState } from "react";
import { useHelper } from "@react-three/drei";
import { Box3, BoxHelper, Mesh, Object3D, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";

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
  scale?: [number, number, number];
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onClick?: (e: any) => void;
}

const WallItemModelComponent = forwardRef<Object3D, ItemModelProps>(
  (
    {
      path,
      selected = false,
      position,
      rotation,
      dimensions,
      scale = [1, 1, 1],
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onClick,
    },
    ref,
  ) => {
    const modelRef = useRef<Object3D | null>(null);
    const loader = useMemo(() => new GLTFLoader(), []);
    const [gltfScene, setGltfScene] = useState<Object3D | null>(null);

    // Fallback url
    const modelFilename = useMemo(() => {
      const parts = path.split("/");
      return parts[parts.length - 1];
    }, [path]);

    const fallbackUrl = useMemo(() => {
      return `${process.env.NEXT_PUBLIC_MINIO_SERVER}/items/items/${modelFilename}`;
    }, [modelFilename]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        for (const url of [path, fallbackUrl]) {
          try {
            const gltf = await new Promise<any>((res, rej) =>
              loader.load(url, res, undefined, rej),
            );
            if (!cancelled) setGltfScene(gltf.scene);
            return;
          } catch {
            console.warn(`Failed to load Model from ${url}; trying next…`);
          }
        }
        if (!cancelled) {
          console.error("Both primary and fallback GLB paths failed.");
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [path, fallbackUrl, loader]);
    // Fallback url end

    // Calculate initial bounding box data from the original scene
    const initialBounds = useMemo(() => {
      if (!gltfScene) return { size: new Vector3(), center: new Vector3() };
      const bbox = new Box3().setFromObject(gltfScene);
      const size = new Vector3();
      const center = new Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);
      return { size, center };
    }, [gltfScene]);

    // Clone the scene to avoid mutating the original
    const clonedScene = useMemo(
      () => (gltfScene ? gltfScene.clone(true) : null),
      [gltfScene],
    );

    const [adjustedScale, adjustedPosition] = useMemo(() => {
      const { size, center } = initialBounds;

      const scaleX = dimensions.width / size.x;
      const scaleY = dimensions.height / size.y;
      const scaleZ = dimensions.depth / size.z;

      // const adjustedScale: [number, number, number] = [scaleX, scaleY, scaleZ];
      const adjustedScale: [number, number, number] = [
        scaleX * scale[0],
        scaleY * scale[1],
        scaleZ * scale[2],
      ];

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
      if (!currentScene) return;
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

    if (!clonedScene) return null;

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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={onClick}
        />
      </>
    );
  },
);

WallItemModelComponent.displayName = "WallItemModel";

export default React.memo(WallItemModelComponent);
