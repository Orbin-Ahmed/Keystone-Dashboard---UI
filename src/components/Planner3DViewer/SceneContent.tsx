import React, { useMemo, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import {
  Line,
  LineData,
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
  Shape,
  ExtrudeGeometry,
} from "three";
import { CSG } from "three-csg-ts";
import Model from "./Model";
import CameraController from "./CameraController";
import RoomLabel from "./RoomLabel";

const ensureWallPoints = (
  points: number[],
): [number, number, number, number] => {
  if (points.length !== 4) {
    throw new Error("Wall points must contain exactly 4 values");
  }
  return [points[0], points[1], points[2], points[3]];
};

const SceneContent: React.FC<{
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
}> = ({
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
}) => {
  const { scene } = useThree();

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

  const textures = {
    floor: useLoader(TextureLoader, "/textures/hardwood.png"),
    wall: useLoader(TextureLoader, "/textures/marbletiles.jpg"),
    roof: useLoader(TextureLoader, "/textures/wallmap_yellow.png"),
  };

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    };
  }, [textures]);

  const wallHeight = 120;
  const wallThickness = 10;
  const doorDimensions = { width: 50, height: 100 };
  const windowDimensions = { width: 60, height: 50 };

  const { centerX, centerY, minX, maxX, minY, maxY } = useMemo(() => {
    const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
    const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);
    return {
      minX: Math.min(...allX),
      maxX: Math.max(...allX),
      minY: Math.min(...allY),
      maxY: Math.max(...allY),
      centerX: (Math.min(...allX) + Math.max(...allX)) / 2,
      centerY: (Math.min(...allY) + Math.max(...allY)) / 2,
    };
  }, [lines]);

  const Roof = useMemo(() => {
    if (!showRoof) return null;

    return (
      <mesh position={[0, wallHeight, 0]}>
        <boxGeometry args={[maxX - minX, 2, maxY - minY]} />
        <meshStandardMaterial map={textures.roof} side={DoubleSide} />
      </mesh>
    );
  }, [showRoof, maxX, minX, maxY, minY, wallHeight, textures.roof]);

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

  const createBuildingShape = (
    lines: Line[],
    centerX: number,
    centerY: number,
  ) => {
    const segments = lines.map((line) => ({
      start: new Vector2(line.points[0], line.points[1]),
      end: new Vector2(line.points[2], line.points[3]),
    }));
    const outerPoints = [];
    let currentPoint = segments[0].start;
    const usedSegments = new Set();

    while (outerPoints.length < segments.length) {
      outerPoints.push(currentPoint);
      const nextSegment = segments.find((segment, index) => {
        if (usedSegments.has(index)) return false;
        return (
          currentPoint.distanceTo(segment.start) < 1 ||
          currentPoint.distanceTo(segment.end) < 1
        );
      });

      if (!nextSegment) break;

      usedSegments.add(segments.indexOf(nextSegment));
      if (currentPoint.distanceTo(nextSegment.start) < 1) {
        currentPoint = nextSegment.end;
      } else {
        currentPoint = nextSegment.start;
      }
    }

    const shape = new Shape();
    const localPoints = outerPoints.map(
      (point) => new Vector2(point.x - centerX, point.y - centerY),
    );
    shape.moveTo(localPoints[0].x, localPoints[0].y);
    for (let i = 1; i < localPoints.length; i++) {
      shape.lineTo(localPoints[i].x, localPoints[i].y);
    }
    shape.closePath();

    return {
      floorShape: shape,
      outerWallPoints: localPoints.map((p) => [p.x, p.y]),
    };
  };

  const { floorShape } = createBuildingShape(lines, centerX, centerY);

  // Floor
  const Floor = useMemo(() => {
    if (!floorShape) return null;

    const geometry = new ExtrudeGeometry(floorShape);
    geometry.scale(1, -1, 1);

    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <primitive object={geometry} />
        <meshStandardMaterial map={textures.floor} />
      </mesh>
    );
  }, [floorShape, textures.floor]);

  return (
    <>
      <CameraController
        activeTourPoint={activeTourPoint}
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
      />

      {/* Lights */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 50, 25]} intensity={0.8} />
      <directionalLight position={[-10, 50, -25]} intensity={0.6} />
      <pointLight position={[0, 100, 0]} intensity={0.4} />
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

      {Roof}

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
              const modelPath =
                type === "window"
                  ? "window/window_twin_casement.glb"
                  : isOuter
                    ? "door/door.glb"
                    : "door/door_wooden.glb";

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
                />
              );
            })}
          </group>
        );
      })}
    </>
  );
};

export default SceneContent;
