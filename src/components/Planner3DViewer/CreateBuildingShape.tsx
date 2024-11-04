import { Line, Point } from "@/types";
import { Vector2, Shape } from "three";

interface WallSegment {
  line: Line;
  reversed: boolean;
}

interface Node {
  point: Point;
  connected: Set<string>;
}

const CreateBuildingShape = (
  lines: Line[],
  centerX: number,
  centerY: number,
) => {
  const DISTANCE_THRESHOLD = 20;
  const nodes = new Map<string, Node>();

  const debug = (message: string, ...args: any[]) => {
    console.log(`[BuildingShape] ${message}`, ...args);
  };

  const getPointKey = (p: Point): string => {
    return `${Math.round(p.x)}_${Math.round(p.y)}`;
  };

  const pointsEqual = (p1: Point | null, p2: Point | null): boolean => {
    if (!p1 || !p2) return false;
    return (
      Math.abs(p1.x - p2.x) < DISTANCE_THRESHOLD &&
      Math.abs(p1.y - p2.y) < DISTANCE_THRESHOLD
    );
  };

  const getEndPoints = (line: Line): [Point, Point] => {
    const [x1, y1, x2, y2] = line.points;
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  };

  const buildGraph = () => {
    lines.forEach((line) => {
      const [start, end] = getEndPoints(line);
      const startKey = getPointKey(start);
      const endKey = getPointKey(end);

      if (!nodes.has(startKey)) {
        nodes.set(startKey, { point: start, connected: new Set([line.id]) });
      } else {
        const node = nodes.get(startKey);
        if (node) {
          node.connected.add(line.id);
        }
      }

      if (!nodes.has(endKey)) {
        nodes.set(endKey, { point: end, connected: new Set([line.id]) });
      } else {
        const node = nodes.get(endKey);
        if (node) {
          node.connected.add(line.id);
        }
      }
    });

    const nodeKeys = Array.from(nodes.keys());
    for (let i = 0; i < nodeKeys.length; i++) {
      for (let j = i + 1; j < nodeKeys.length; j++) {
        const node1 = nodes.get(nodeKeys[i]);
        const node2 = nodes.get(nodeKeys[j]);

        if (node1 && node2 && pointsEqual(node1.point, node2.point)) {
          const mergedSet = new Set<string>();
          node1.connected.forEach((id) => mergedSet.add(id));
          node2.connected.forEach((id) => mergedSet.add(id));
          node1.connected = mergedSet;
          nodes.delete(nodeKeys[j]);
        }
      }
    }
  };

  const findExternalWalls = (): WallSegment[] => {
    buildGraph();
    const externalWalls: WallSegment[] = [];
    const visited = new Set<string>();

    const nodeEntries = Array.from(nodes.entries());
    if (nodeEntries.length === 0) return [];

    let startNodeKey = nodeEntries.reduce((leftmost, [key, node]) => {
      const leftmostNode = nodes.get(leftmost);
      return leftmostNode && node.point.x < leftmostNode.point.x
        ? key
        : leftmost;
    }, nodeEntries[0][0]);

    let currentNodeKey = startNodeKey;
    let previousLineId: string | null = null;

    while (true) {
      const currentNode = nodes.get(currentNodeKey);
      if (!currentNode) break;

      const connectedLines: Line[] = [];
      currentNode.connected.forEach((lineId) => {
        const line = lines.find((l) => l.id === lineId);
        if (line && !visited.has(lineId)) {
          connectedLines.push(line);
        }
      });

      if (connectedLines.length === 0) {
        const firstWall = externalWalls[0];
        const startNode = nodes.get(startNodeKey);
        if (
          firstWall &&
          startNode &&
          pointsEqual(currentNode.point, startNode.point)
        ) {
          break;
        }
        break;
      }

      let bestLine: Line | null = null;
      let bestEndPoint: Point | null = null;
      let bestAngle = -Infinity;

      connectedLines.forEach((line) => {
        const [start, end] = getEndPoints(line);
        const isStartPoint = pointsEqual(currentNode.point, start);
        const candidatePoint = isStartPoint ? end : start;

        if (previousLineId) {
          const prevLine = lines.find((l) => l.id === previousLineId);
          if (prevLine) {
            const [prevStart, prevEnd] = getEndPoints(prevLine);
            const prevVector = {
              x: prevEnd.x - prevStart.x,
              y: prevEnd.y - prevStart.y,
            };
            const newVector = {
              x: candidatePoint.x - currentNode.point.x,
              y: candidatePoint.y - currentNode.point.y,
            };

            let angle =
              Math.atan2(newVector.y, newVector.x) -
              Math.atan2(prevVector.y, prevVector.x);
            if (angle < 0) angle += 2 * Math.PI;

            if (angle > bestAngle) {
              bestAngle = angle;
              bestLine = line;
              bestEndPoint = candidatePoint;
            }
          }
        } else {
          bestLine = line;
          bestEndPoint = candidatePoint;
        }
      });

      if (!bestLine || !bestEndPoint) break;

      const [start, end] = getEndPoints(bestLine);
      const reversed = pointsEqual(bestEndPoint, start);
      externalWalls.push({ line: bestLine, reversed });
      visited.add((bestLine as Line).id);
      previousLineId = (bestLine as Line).id;

      const nextNodeKey = Array.from(nodes.keys()).find((key) => {
        const node = nodes.get(key);
        return node && pointsEqual(node.point, bestEndPoint);
      });

      if (!nextNodeKey) break;
      currentNodeKey = nextNodeKey;

      if (externalWalls.length > lines.length * 2) break;
    }

    return externalWalls;
  };

  const createShape = (walls: WallSegment[]): Shape | null => {
    if (walls.length < 3) return null;

    const shape = new Shape();
    let isFirst = true;
    let firstVector: Vector2 | null = null;

    for (let i = 0; i < walls.length; i++) {
      const wallSegment = walls[i];
      const { line, reversed } = wallSegment;
      const [x1, y1, x2, y2] = line.points;

      const point1 = reversed
        ? new Vector2(x2 - centerX, y2 - centerY)
        : new Vector2(x1 - centerX, y1 - centerY);
      const point2 = reversed
        ? new Vector2(x1 - centerX, y1 - centerY)
        : new Vector2(x2 - centerX, y2 - centerY);

      if (i === 0) {
        firstVector = point1;
        shape.moveTo(point1.x, point1.y);
        shape.lineTo(point2.x, point2.y);
      } else {
        shape.lineTo(point1.x, point1.y);
        shape.lineTo(point2.x, point2.y);
      }
    }

    if (firstVector) {
      shape.lineTo(firstVector.x, firstVector.y);
    }

    return shape;
  };

  const externalWalls = findExternalWalls();
  const floorShape = createShape(externalWalls);

  const outerWallPoints = externalWalls.map((wallSegment) => {
    const { line, reversed } = wallSegment;
    const [x1, y1] = reversed
      ? [line.points[2], line.points[3]]
      : [line.points[0], line.points[1]];
    return [x1 - centerX, y1 - centerY] as [number, number];
  });

  return {
    floorShape,
    outerWallPoints,
  };
};

export default CreateBuildingShape;
