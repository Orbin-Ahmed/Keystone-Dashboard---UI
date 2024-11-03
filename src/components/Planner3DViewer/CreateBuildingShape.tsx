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
  const THRESHOLD = 20;

  // Helper function to determine if two points are within the threshold distance
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

  // Find the starting line: the line with the smallest y-coordinate, or the leftmost x if tied
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

  // Traverse all lines to follow the outer boundary
  const traverseOuterBoundary = () => {
    const boundaryPoints: Vector2[] = [];
    const visitedLines = new Set<Line>();

    // Get the starting line and initialize traversal
    let currentLine = findStartingLine();
    let [startX, startY] = currentLine.points.slice(0, 2);
    boundaryPoints.push(new Vector2(startX, startY));
    visitedLines.add(currentLine);

    // Traverse until we loop back to the start or exhaust possible connections
    while (true) {
      let [x1, y1, x2, y2] = currentLine.points;
      let nextPoint = new Vector2(x2, y2);

      if (!boundaryPoints[0].equals(nextPoint)) {
        boundaryPoints.push(nextPoint);
      } else {
        break; // Closed loop detected
      }

      // Find the closest line segment from the current endpoint (x2, y2)
      let closestLine: Line | null = null;
      let minDistance = Infinity;

      for (const line of lines) {
        if (visitedLines.has(line)) continue;
        const [lx1, ly1, lx2, ly2] = line.points;

        // Check both endpoints of the line to see if they are within threshold of the current endpoint
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

      // Stop if no unvisited close line is found
      if (!closestLine) break;

      // Update for next iteration
      visitedLines.add(closestLine);
      currentLine = closestLine;
    }

    return boundaryPoints;
  };

  // Generate the shape using the outer boundary points
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
  shape.lineTo(localPoints[0].x, localPoints[0].y); // Close the shape

  return {
    floorShape: shape,
    outerWallPoints: localPoints.map((p) => [p.x, p.y] as [number, number]),
  };
};

export default CreateBuildingShape;
