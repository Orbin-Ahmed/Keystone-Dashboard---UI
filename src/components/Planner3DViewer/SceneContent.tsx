import React, { useMemo, useEffect, useRef } from "react";
import { useLoader, useThree, ThreeEvent, useFrame } from "@react-three/fiber";
import {
  LineData,
  PlacedItemType,
  PlacingItemType,
  Point,
  RoomName,
  ShapeData,
  TourPoint,
  WallClassification,
} from "@/types";
import {
  Vector3,
  TextureLoader,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Vector2,
  DoubleSide,
  ExtrudeGeometry,
  RepeatWrapping,
  Shape,
  Raycaster,
  Plane,
  Object3D,
} from "three";
import { CSG } from "three-csg-ts";
import Model from "./Model";
import ItemModel from "./ItemModel";
import CameraController from "@/components/Planner3DViewer/CameraController";
import RoomLabel from "@/components/Planner3DViewer/RoomLabel";
import { GLTFExporter } from "three-stdlib";

interface SceneContentProps {
  lines: LineData[];
  shapes: ShapeData[];
  roomNames: RoomName[];
  activeTourPoint: TourPoint | null;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  isAutoRotating: boolean;
  setIsAutoRotating: (value: boolean) => void;
  showRoof: boolean;
  tourPoints: TourPoint[];
  onTourPointClick: (point: TourPoint) => void;
  floorPlanPoints: Point[];
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  onModelClick: (shape: ShapeData) => void;
  modelPathsByShapeId: Record<string, string>;
  shouldExport: boolean;
  setShouldExport: React.Dispatch<React.SetStateAction<boolean>>;
  placingItem: PlacingItemType | null;
  placedItems: PlacingItemType[];
  setPlacingItem: React.Dispatch<React.SetStateAction<PlacingItemType | null>>;
  selectedItem: PlacedItemType | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<PlacedItemType | null>>;
}

const ensureWallPoints = (
  points: number[],
): [number, number, number, number] => {
  if (points.length !== 4) {
    throw new Error("Wall points must contain exactly 4 values");
  }
  return [points[0], points[1], points[2], points[3]];
};

const CreateFloorShape = (
  floorPlanPoints: Point[],
  centerX: number,
  centerY: number,
) => {
  if (floorPlanPoints.length < 3) {
    console.error("Not enough floor plan points to create a shape.");
    return null;
  }

  const shape = new Shape();

  const firstPoint = floorPlanPoints[0];
  shape.moveTo(firstPoint.x - centerX, firstPoint.y - centerY);

  for (let i = 1; i < floorPlanPoints.length; i++) {
    const point = floorPlanPoints[i];
    shape.lineTo(point.x - centerX, point.y - centerY);
  }

  shape.lineTo(firstPoint.x - centerX, firstPoint.y - centerY);

  return shape;
};

const SceneContent: React.FC<SceneContentProps> = ({
  lines,
  shapes,
  roomNames,
  activeTourPoint,
  isTransitioning,
  setIsTransitioning,
  isAutoRotating,
  setIsAutoRotating,
  showRoof,
  tourPoints,
  onTourPointClick,
  floorPlanPoints,
  centerX,
  centerY,
  minX,
  maxX,
  minY,
  maxY,
  onModelClick,
  modelPathsByShapeId,
  shouldExport,
  setShouldExport,
  placingItem,
  setPlacingItem,
  placedItems,
  selectedItem,
  setSelectedItem,
}) => {
  const { scene, camera, gl } = useThree();
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 1, 0), 0);

  const wallHeight = 120;
  const wallThickness = 10;
  const doorDimensions = { width: 50, height: 100 };
  const windowDimensions = { width: 60, height: 50 };

  const isDragging = useRef(false);
  const dragOffset = useRef<[number, number, number] | null>(null);
  const placingItemRef = useRef<PlacingItemType | null>(placingItem);
  const modelRef = useRef<Object3D | null>(null);

  const wallClassifications = useMemo(() => {
    const classifications: Record<string, WallClassification> = {};
    const tolerance = 5;

    const wallEndpoints: Array<[number, number, number, number]> = [];
    const wallIds: string[] = [];

    lines.forEach((line) => {
      wallEndpoints.push(ensureWallPoints(line.points));
      wallIds.push(line.id);
    });

    wallEndpoints.forEach((wall, wallIndex) => {
      const [x1, y1, x2, y2] = wall;
      const wallId = wallIds[wallIndex];
      const wallCenter = new Vector2((x1 + x2) / 2, (y1 + y2) / 2);
      const wallNormal = new Vector2(-(y2 - y1), x2 - x1).normalize();
      const toCenterVector = new Vector2(
        centerX - wallCenter.x,
        centerY - wallCenter.y,
      ).normalize();

      const isFacingInward = wallNormal.dot(toCenterVector) > 0;
      const isHorizontal = Math.abs(y1 - y2) < tolerance;
      const isVertical = Math.abs(x1 - x2) < tolerance;

      const isAtHorizontalBoundary =
        Math.abs(y1 - minY) < tolerance ||
        Math.abs(y1 - maxY) < tolerance ||
        Math.abs(y2 - minY) < tolerance ||
        Math.abs(y2 - maxY) < tolerance;

      const isAtVerticalBoundary =
        Math.abs(x1 - minX) < tolerance ||
        Math.abs(x1 - maxX) < tolerance ||
        Math.abs(x2 - minX) < tolerance ||
        Math.abs(x2 - maxX) < tolerance;

      const isOuter =
        (isHorizontal && isAtHorizontalBoundary) ||
        (isVertical && isAtVerticalBoundary);

      classifications[wallId] = {
        isOuter,
        isFacingInward,
      };
    });

    return classifications;
  }, [lines, centerX, centerY, minX, maxX, minY, maxY]);

  const shapesByWallId = useMemo(() => {
    return shapes.reduce(
      (acc, shape) => {
        if (!acc[shape.wallId]) {
          acc[shape.wallId] = [];
        }
        acc[shape.wallId].push(shape);
        return acc;
      },
      {} as Record<string, ShapeData[]>,
    );
  }, [shapes]);

  const floorShape = useMemo(() => {
    const shape = CreateFloorShape(floorPlanPoints, centerX, centerY);
    if (!shape) {
      console.error("Failed to create floor shape.");
      return null;
    }
    return shape;
  }, [floorPlanPoints]);

  const textures = {
    floor: useLoader(TextureLoader, "/textures/marbel.jpg"),
    wall: useLoader(TextureLoader, "/textures/wallmap_yellow.png"),
    roof: useLoader(TextureLoader, "/textures/wallmap_yellow.png"),
  };

  useEffect(() => {
    if (shouldExport) {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (result) => {
          const output =
            result instanceof ArrayBuffer ? result : JSON.stringify(result);
          const blob = new Blob([output], { type: "model/gltf-binary" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "scene.glb";
          link.click();
          URL.revokeObjectURL(link.href);
          setShouldExport(false);
        },
        (error) => {
          console.error("An error occurred during GLTF export", error);
          setShouldExport(false);
        },
        { binary: true },
      );
    }
  }, [shouldExport, scene, setShouldExport]);

  useEffect(() => {
    return () => {
      const disposeObject = (obj: any) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((material: any) => disposeMaterial(material));
          } else {
            disposeMaterial(obj.material);
          }
        }

        if (obj.children) {
          obj.children.forEach(disposeObject);
        }
      };

      const disposeMaterial = (material: any) => {
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        material.dispose();
      };

      scene.traverse(disposeObject);
    };
  }, [scene]);

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    };
  }, [textures]);

  const Floor = useMemo(() => {
    if (!floorShape) {
      console.log("No floor shape available");
      return null;
    }

    const geometry = new ExtrudeGeometry(floorShape, {
      depth: 1,
      bevelEnabled: false,
    });

    geometry.rotateX(Math.PI / 2);

    const floorTexture = textures.floor;
    floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
    const textureUnitSize = 100000;
    const floorWidth = maxX - minX;
    const floorHeight = maxY - minY;
    const textureRepeatX = floorWidth / textureUnitSize;
    const textureRepeatY = floorHeight / textureUnitSize;
    floorTexture.repeat.set(textureRepeatX, textureRepeatY);

    return (
      <mesh geometry={geometry} position={[0, 0, 0]}>
        <meshStandardMaterial map={floorTexture} side={DoubleSide} />
      </mesh>
    );
  }, [floorShape]);

  const Roof = useMemo(() => {
    if (!showRoof || !floorShape) return null;

    const geometry = new ExtrudeGeometry(floorShape, {
      depth: 1,
      bevelEnabled: false,
    });

    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, wallHeight + 1, 0);

    return (
      <mesh geometry={geometry} position={[0, 0, 0]}>
        <meshStandardMaterial map={textures.roof} side={DoubleSide} />
      </mesh>
    );
  }, [floorShape, showRoof]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!placingItemRef.current) return;

    isDragging.current = true;

    const mouse = new Vector2();
    mouse.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersectPoint = new Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    const itemPosition = new Vector3(
      ...(placingItemRef.current.position || [0, 0, 0]),
    );
    const offset = itemPosition.clone().sub(intersectPoint);
    dragOffset.current = [offset.x, offset.y, offset.z];
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current || !placingItemRef.current) return;
    e.stopPropagation();

    const mouse = new Vector2();
    mouse.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersectPoint = new Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    const newPosition = intersectPoint.clone();
    if (dragOffset.current) {
      newPosition.add(new Vector3(...dragOffset.current));
    }

    // Update the position without triggering a re-render
    if (placingItemRef.current) {
      placingItemRef.current.position = [newPosition.x, 0, newPosition.z];
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = false;
    dragOffset.current = null;
    gl.domElement.style.cursor = "default";
  };

  const handlePointerOver = () => {
    if (placingItem) {
      gl.domElement.style.cursor = "move";
    }
  };

  const handlePointerOut = () => {
    gl.domElement.style.cursor = "default";
  };

  const handlePlacedItemClick = (item: any) => {
    setSelectedItem(item);
  };

  useEffect(() => {
    placingItemRef.current = placingItem;
    if (!placingItem) {
      isDragging.current = false;
      dragOffset.current = null;
      gl.domElement.style.cursor = "default";
    }
  }, [placingItem, gl.domElement.style]);

  useFrame(() => {
    if (placingItemRef.current && modelRef.current) {
      modelRef.current.position.set(
        ...(placingItemRef.current.position || [0, 0, 0]),
      );
      modelRef.current.rotation.set(
        ...(placingItemRef.current.rotation || [0, 0, 0]),
      );
    }
  });

  return (
    <>
      <CameraController
        activeTourPoint={activeTourPoint}
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
        disableControls={!!placingItem}
      />
      {/* Lights */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 50, 25]} intensity={0.8} />
      <directionalLight position={[-10, 50, -25]} intensity={0.8} />
      <hemisphereLight intensity={0.3} />
      {/* Tour Points */}
      {tourPoints.map((point) => (
        <mesh
          key={point.id}
          position={point.position}
          onClick={() => onTourPointClick(point)}
        >
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}
      {/* Room Labels */}
      {roomNames.map((room) => (
        <RoomLabel
          key={room.id}
          position={[room.x - centerX, wallHeight / 2, room.y - centerY]}
          name={room.name}
        />
      ))}
      {/* Roof  */}
      {Roof}
      {/* Floor  */}
      {Floor}
      {/* Walls */}
      {lines.map((line) => {
        const points = ensureWallPoints(line.points);
        const [x1, y1, x2, y2] = points;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const wallPosition = new Vector3(
          (x1 + x2) / 2 - centerX,
          wallHeight / 2,
          (y1 + y2) / 2 - centerY,
        );
        const angle = Math.atan2(y2 - y1, x2 - x1);

        // Determine if wall is facing inward
        const wallClass = wallClassifications[line.id];
        const { isOuter, isFacingInward } = wallClass;

        const wallGeometry = new BoxGeometry(length, wallHeight, wallThickness);

        let wallMesh = new Mesh(
          wallGeometry,
          new MeshStandardMaterial({ map: textures.wall }),
        );

        const shapesOnWall = shapesByWallId[line.id] || [];

        shapesOnWall.forEach((shape) => {
          const { type, x, y } = shape;
          const cutoutWidth =
            type === "door" ? doorDimensions.width : windowDimensions.width;
          const cutoutHeight =
            type === "door" ? doorDimensions.height : windowDimensions.height;
          const cutoutGeometry = new BoxGeometry(
            cutoutWidth,
            cutoutHeight,
            wallThickness,
          );
          const shapeWorldX = x - centerX;
          const shapeWorldZ = y - centerY;
          const dx = shapeWorldX - wallPosition.x;
          const dz = shapeWorldZ - wallPosition.z;
          const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
          const localY =
            type === "window" ? 0 : -wallHeight / 2 + doorDimensions.height / 2;
          cutoutGeometry.translate(localX, localY, 0);
          const cutoutMesh = new Mesh(cutoutGeometry);
          wallMesh = CSG.subtract(
            wallMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
            cutoutMesh as Mesh<BoxGeometry, MeshStandardMaterial>,
          ) as Mesh<BoxGeometry, MeshStandardMaterial>;
        });

        return (
          <group
            key={line.id}
            position={wallPosition}
            rotation={[0, -angle, 0]}
          >
            <primitive object={wallMesh} />
            {shapesOnWall.map((shape) => {
              const { type, x, y, id } = shape;
              const defaultModelPath =
                type === "window"
                  ? "window/window_twin_casement.glb"
                  : isOuter
                    ? "door/door.glb"
                    : "door/door_wooden.glb";

              const modelPath = modelPathsByShapeId[id] || defaultModelPath;
              const shapeWorldX = x - centerX;
              const shapeWorldZ = y - centerY;
              const dx = shapeWorldX - wallPosition.x;
              const dz = shapeWorldZ - wallPosition.z;
              const localX = dx * Math.cos(angle) + dz * Math.sin(angle);
              const localY =
                type === "window"
                  ? 0
                  : -wallHeight / 2 + doorDimensions.height / 2;
              const rotationY =
                type === "door"
                  ? isFacingInward
                    ? Math.PI
                    : 0
                  : isFacingInward
                    ? 0
                    : Math.PI;

              return (
                <Model
                  key={id}
                  path={modelPath}
                  position={[localX, localY, 0]}
                  rotation={[0, rotationY, 0]}
                  type={type}
                  wallThickness={wallThickness}
                  wallHeight={wallHeight}
                  doorDimensions={doorDimensions}
                  windowDimensions={windowDimensions}
                  onClick={() => onModelClick(shape)}
                />
              );
            })}
          </group>
        );
      })}
      {/* Currently placing item */}
      {placingItem && (
        <ItemModel
          ref={modelRef}
          key="placing-item"
          path={placingItem.path}
          position={placingItem.position || [0, 0, 0]}
          rotation={placingItem.rotation || [0, 0, 0]}
          dimensions={{
            width: placingItem.width,
            height: placingItem.height,
            depth: placingItem.depth,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      )}

      {/* Placed items */}
      {placedItems
        .filter((item) => item.id !== (placingItem?.id || selectedItem?.id))
        .map((item) => (
          <ItemModel
            key={item.id}
            path={item.path}
            position={item.position || [0, 0, 0]}
            rotation={item.rotation || [0, 0, 0]}
            dimensions={{
              width: item.width,
              height: item.height,
              depth: item.depth,
            }}
            onClick={() => handlePlacedItemClick(item)}
          />
        ))}
    </>
  );
};

export default SceneContent;
