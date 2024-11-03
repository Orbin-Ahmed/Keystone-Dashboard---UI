import { Vector2, Shape } from "three";
import { Line } from "@/types";

interface WallSegment {
  line: Line;
  reversed: boolean;
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

    const externalWalls: WallSegment[] = [];
    const visited = new Set<string>();

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

    let currentLine = startLine;
    let [x1, y1, x2, y2] = currentLine.points;
    let currentEndPoint = new Vector2(x2, y2);

    externalWalls.push({ line: currentLine, reversed: false });
    visited.add(currentLine.id);

    const findNextWall = (
      currentLine: Line,
      currentEndPoint: Vector2,
    ): { nextLine: Line; nextEndPoint: Vector2; reversed: boolean } | null => {
      let bestMatch: Line | null = null;
      let bestMatchEndPoint: Vector2 | null = null;
      let reversed = false;
      let minDistance = DISTANCE_THRESHOLD;

      lines.forEach((line) => {
        if (visited.has(line.id) || line.id === currentLine.id) return;

        const [x1, y1, x2, y2] = line.points;
        const start = new Vector2(x1, y1);
        const end = new Vector2(x2, y2);

        // Check if the start point is close to the current end point
        const distanceStart = start.distanceTo(currentEndPoint);
        if (distanceStart < minDistance) {
          minDistance = distanceStart;
          bestMatch = line;
          bestMatchEndPoint = end; // The next end point will be the other end
          reversed = false;
        }

        // Check if the end point is close to the current end point
        const distanceEnd = end.distanceTo(currentEndPoint);
        if (distanceEnd < minDistance) {
          minDistance = distanceEnd;
          bestMatch = line;
          bestMatchEndPoint = start; // The next end point will be the other end
          reversed = true; // We need to reverse the line
        }
      });

      if (bestMatch && bestMatchEndPoint) {
        return {
          nextLine: bestMatch,
          nextEndPoint: bestMatchEndPoint,
          reversed,
        };
      } else {
        return null;
      }
    };

    while (true) {
      const nextWallResult = findNextWall(currentLine, currentEndPoint);

      if (!nextWallResult) {
        debug("No next wall found, breaking chain");
        break;
      }

      const { nextLine, nextEndPoint, reversed } = nextWallResult;

      debug("Found next wall:", nextLine);
      externalWalls.push({ line: nextLine, reversed });
      visited.add(nextLine.id);

      // Update currentLine and currentEndPoint
      currentLine = nextLine;
      currentEndPoint = nextEndPoint;

      // Check if we have looped back to the starting point
      const firstPoint = new Vector2(startLine.points[0], startLine.points[1]);
      const distance = currentEndPoint.distanceTo(firstPoint);
      if (distance < DISTANCE_THRESHOLD) {
        debug("Found path back to start!");
        break;
      }

      if (externalWalls.length > lines.length) {
        debug("Safety break - too many walls");
        break;
      }
    }

    debug("Found external walls:", externalWalls.length);
    return externalWalls;
  };

  const createShape = (walls: WallSegment[]): Shape | null => {
    if (walls.length < 3) {
      debug("Not enough walls to create shape");
      return null;
    }

    const shape = new Shape();
    let firstPoint: Vector2 = new Vector2(0, 0);
    let lastPoint: Vector2 = new Vector2(0, 0);

    walls.forEach((wallSegment, index) => {
      const { line, reversed } = wallSegment;
      const [x1, y1, x2, y2] = line.points;

      const point1 = reversed
        ? new Vector2(x2 - centerX, y2 - centerY)
        : new Vector2(x1 - centerX, y1 - centerY);
      const point2 = reversed
        ? new Vector2(x1 - centerX, y1 - centerY)
        : new Vector2(x2 - centerX, y2 - centerY);

      if (index === 0) {
        firstPoint = point1.clone();
        shape.moveTo(point1.x, point1.y);
      }

      shape.lineTo(point2.x, point2.y);
      lastPoint = point2.clone();
    });

    if (lastPoint.distanceTo(firstPoint) > 1) {
      shape.lineTo(firstPoint.x, firstPoint.y);
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
