import { Shape } from "three";

interface Point {
  id: string;
  x: number;
  y: number;
}

const CreateFloorShape = (
  floorPlanPoints: Point[],
  centerX: number,
  centerY: number,
): Shape => {
  if (floorPlanPoints.length < 3) {
    console.error("Not enough floor plan points to create a shape.");
    throw new Error("At least 3 points are required to create a floor shape");
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

export default CreateFloorShape;