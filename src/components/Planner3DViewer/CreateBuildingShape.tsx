import { Vector2, Shape } from "three";
import { Line } from "@/types";

interface Point {
  x: number;
  y: number;
}

const CreateBuildingShape = (
  lines: Line[],
  centerX: number,
  centerY: number,
) => {
  const DISTANCE_THRESHOLD = 10;

  const debug = (message: string, ...args: any[]) => {
    console.log(`[BuildingShape] ${message}`, ...args);
  };

  const findExternalWalls = () => {
    const sortedLines = [...lines].sort((a, b) => {
      const aMinX = Math.min(a.points[0], a.points[2]);
      const bMinX = Math.min(b.points[0], b.points[2]);
      return aMinX - bMinX;
    });

    let externalWalls: Line[] = [];
    let visited = new Set<string>();

    let startLine = sortedLines.find((line) => {
      const [x1, y1, x2, y2] = line.points;
      const isVertical = Math.abs(x1 - x2) < 10;
      return isVertical;
    });

    if (!startLine) {
      debug("No vertical starting line found, using leftmost line");
      startLine = sortedLines[0];
    }

    if (!startLine) {
      debug("No lines found at all");
      return [];
    }

    debug("Starting line:", startLine);

    const findNextWall = (
      currentLine: Line,
      currentEndPoint: Vector2,
    ): Line | null => {
      let bestMatch: Line | null = null;
      let minDistance = DISTANCE_THRESHOLD;

      const [cx1, cy1, cx2, cy2] = currentLine.points;
      const currentVector = new Vector2(cx2 - cx1, cy2 - cy1).normalize();

      lines.forEach((line) => {
        if (visited.has(line.id) || line.id === currentLine.id) return;

        const [x1, y1, x2, y2] = line.points;
        const start = new Vector2(x1, y1);
        const end = new Vector2(x2, y2);

        [start, end].forEach((point) => {
          const distance = point.distanceTo(currentEndPoint);
          if (distance < minDistance) {
            const nextVector = new Vector2(x2 - x1, y2 - y1).normalize();
            const dotProduct = currentVector.dot(nextVector);

            if (Math.abs(dotProduct) < 0.1 || Math.abs(dotProduct) > 0.9) {
              minDistance = distance;
              bestMatch = line;
            }
          }
        });
      });

      return bestMatch;
    };

    let currentLine = startLine;
    externalWalls.push(currentLine);
    visited.add(currentLine.id);

    while (true) {
      const [x1, y1, x2, y2] = currentLine.points;
      const currentEndPoint = new Vector2(x2, y2);

      const nextWall = findNextWall(currentLine, currentEndPoint);

      if (!nextWall) {
        debug("No next wall found, breaking chain");
        break;
      }

      debug("Found next wall:", nextWall);
      externalWalls.push(nextWall);
      visited.add(nextWall.id);
      currentLine = nextWall;

      if (externalWalls.length > 2) {
        const firstPoint = new Vector2(
          startLine.points[0],
          startLine.points[1],
        );
        const distance = currentEndPoint.distanceTo(firstPoint);
        if (distance < DISTANCE_THRESHOLD) {
          debug("Found path back to start!");
          break;
        }
      }

      if (externalWalls.length > lines.length) {
        debug("Safety break - too many walls");
        break;
      }
    }

    debug("Found external walls:", externalWalls.length);
    return externalWalls;
  };

  const createShape = (walls: Line[]): Shape | null => {
    if (walls.length < 3) {
      debug("Not enough walls to create shape");
      return null;
    }

    const shape = new Shape();
    let firstPoint: Vector2 = new Vector2(0, 0);
    let lastPoint: Vector2 = new Vector2(0, 0);
    let isFirstPoint = true;

    walls.forEach((wall, index) => {
      const [x1, y1, x2, y2] = wall.points;
      const point1 = new Vector2(x1 - centerX, y1 - centerY);
      const point2 = new Vector2(x2 - centerX, y2 - centerY);

      if (index === 0) {
        firstPoint = point1.clone();
        shape.moveTo(point1.x, point1.y);
      }

      shape.lineTo(point2.x, point2.y);
      lastPoint = point2.clone();
    });

    // Close the shape if needed
    if (lastPoint.distanceTo(firstPoint) > 1) {
      shape.lineTo(firstPoint.x, firstPoint.y);
    }

    return shape;
  };

  const externalWalls = findExternalWalls();
  const floorShape = createShape(externalWalls);

  const outerWallPoints = externalWalls.map((wall) => {
    const [x1, y1] = wall.points;
    return [x1 - centerX, y1 - centerY] as [number, number];
  });

  return {
    floorShape,
    outerWallPoints,
  };
};

export default CreateBuildingShape;
