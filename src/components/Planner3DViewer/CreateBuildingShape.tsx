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
  const THRESHOLD = 10;
  const arePointsClose = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): boolean => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy) <= THRESHOLD;
  };
  const findStartingLine = () => {
    return lines.reduce((minLine, line) => {
      const [x1, y1] = line.points.slice(0, 2);
      const [minX, minY] = minLine.points.slice(0, 2);
      if (y1 < minY || (y1 === minY && x1 < minX)) {
        return line;
      }
      return minLine;
    }, lines[0]);
  };
  const traverseOuterBoundary = () => {
    const boundaryPoints: Vector2[] = [];
    const visitedLines = new Set<Line>();
    let currentLine = findStartingLine();
    let [startX, startY] = currentLine.points.slice(0, 2);
    boundaryPoints.push(new Vector2(startX, startY));
    visitedLines.add(currentLine);
    while (true) {
      let [x1, y1, x2, y2] = currentLine.points;
      let nextPoint = new Vector2(x2, y2);

      if (!boundaryPoints[0].equals(nextPoint)) {
        boundaryPoints.push(nextPoint);
      } else {
        break;
      }
      let closestLine: Line | null = null;
      let minDistance = Infinity;

      for (const line of lines) {
        if (visitedLines.has(line)) continue;
        const [lx1, ly1, lx2, ly2] = line.points;
        if (arePointsClose(x2, y2, lx1, ly1) && line !== currentLine) {
          const distance = Math.sqrt((lx1 - x2) ** 2 + (ly1 - y2) ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closestLine = line;
            nextPoint = new Vector2(lx2, ly2);
          }
        } else if (arePointsClose(x2, y2, lx2, ly2) && line !== currentLine) {
          const distance = Math.sqrt((lx2 - x2) ** 2 + (ly2 - y2) ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closestLine = line;
            nextPoint = new Vector2(lx1, ly1);
          }
        }
      }
      if (!closestLine) break;
      visitedLines.add(closestLine);
      currentLine = closestLine;
    }

    return boundaryPoints;
  };
  const boundaryPoints = traverseOuterBoundary();
  if (boundaryPoints.length < 3) {
    console.warn("No valid boundary found for floor shape.");
    return {
      floorShape: null,
      outerWallPoints: [],
    };
  }

  const shape = new Shape();
  const localPoints = boundaryPoints.map(
    (point) => new Vector2(point.x - centerX, point.y - centerY),
  );

  shape.moveTo(localPoints[0].x, localPoints[0].y);
  localPoints.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  shape.lineTo(localPoints[0].x, localPoints[0].y);

  return {
    floorShape: shape,
    outerWallPoints: localPoints.map((p) => [p.x, p.y] as [number, number]),
  };
};

export default CreateBuildingShape;
