"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Line as KonvaLine,
  Image as KonvaImage,
  Circle,
  Arrow,
} from "react-konva";
import useImage from "use-image";
import CustomButton from "../CustomButton";
import Konva from "konva";
import { Text } from "react-konva";

interface Line {
  points: number[];
}

interface Shape {
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  image: HTMLImageElement;
}

const GRID_SIZE = 50;

const PlanEditor = () => {
  const [tool, setTool] = useState<"wall" | "window" | "door" | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [tempLine, setTempLine] = useState<Line | null>(null);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);

  const [windowImage] = useImage("/textures/window.svg");
  const [doorImage] = useImage("/textures/door.svg");
  const PIXELS_PER_METER = 100;
  const [showDimensions, setShowDimensions] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const drawGrid = () => {
    const lines = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < width / GRID_SIZE; i++) {
      lines.push(
        <KonvaLine
          key={`v-${i}`}
          points={[i * GRID_SIZE, 0, i * GRID_SIZE, height]}
          stroke="#ddd"
          strokeWidth={1}
        />,
      );
    }

    for (let j = 0; j < height / GRID_SIZE; j++) {
      lines.push(
        <KonvaLine
          key={`h-${j}`}
          points={[0, j * GRID_SIZE, width, j * GRID_SIZE]}
          stroke="#ddd"
          strokeWidth={1}
        />,
      );
    }

    return lines;
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (tool === "wall" && pos) {
      setStartPoint(pos);
    } else if ((tool === "window" || tool === "door") && pos) {
      const closestLine = findClosestLine(pos);
      if (closestLine && isClickOnWall(closestLine, pos)) {
        const { x, y, angle } = findClosestPointOnLine(closestLine, pos);
        addShape(tool, x, y, angle, closestLine);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "wall" && startPoint) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setTempLine({
          points: [startPoint.x, startPoint.y, pos.x, pos.y],
        });
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "wall" && startPoint) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setLines([
          ...lines,
          { points: [startPoint.x, startPoint.y, pos.x, pos.y] },
        ]);
        setStartPoint(null);
        setTempLine(null);
      }
    }
  };

  const RotateIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0V4L14 2L10 0ZM10 18V20L14 18H10ZM3.757 3.757L2.343 5.172C5.172 8 10 8 10 8C10 8 8 12 5.172 14.828L3.757 13.414L0 17H10V7L6.586 3.757L5.172 2.343L3.757 3.757Z"
        fill="black"
      />
    </svg>
  );

  const DeleteIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2V0H14V2H19V4H1V2H6ZM4 6H16L15.1 18.2C15.04 18.67 14.68 19 14.21 19H5.79C5.32 19 4.96 18.67 4.9 18.2L4 6Z"
        fill="red"
      />
    </svg>
  );

  const addShape = (
    shapeType: "window" | "door",
    x: number,
    y: number,
    angle: number,
    line: Line,
  ) => {
    const image = shapeType === "window" ? windowImage : doorImage;
    const isWindow = shapeType === "window";

    const [x1, y1, x2, y2] = line.points;
    const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const windowWidth = isWindow ? wallLength * 0.1 : 60;
    const windowHeight = 8;

    // const adjustedX = isWindow ? x - windowHeight / 2 : x;
    const adjustedY = isWindow ? y - windowHeight / 2 : y;

    if (image) {
      const newShape: Shape = {
        type: shapeType,
        x,
        y: adjustedY,
        width: isWindow ? windowWidth : 60,
        height: isWindow ? windowHeight : 80,
        image,
        rotation: angle,
      };

      setShapes([...shapes, newShape]);
    }
  };

  const deleteShape = (index: number) => {
    const updatedShapes = [...shapes];
    updatedShapes.splice(index, 1);
    setShapes(updatedShapes);
  };

  const rotateShape = (index: number) => {
    const updatedShapes = [...shapes];
    updatedShapes[index].rotation = (updatedShapes[index].rotation || 0) + 90;
    setShapes(updatedShapes);
  };

  const findClosestLine = (pos: { x: number; y: number }): Line | null => {
    let closestLine: Line | null = null;
    let minDist = Infinity;

    lines.forEach((line) => {
      const dist = distanceToLine(line, pos);
      if (dist < minDist) {
        minDist = dist;
        closestLine = line;
      }
    });

    return closestLine;
  };

  const isClickOnWall = (line: Line, point: { x: number; y: number }) => {
    const threshold = 10;
    return distanceToLine(line, point) < threshold;
  };

  const distanceToLine = (line: Line, point: { x: number; y: number }) => {
    const [x1, y1, x2, y2] = line.points;
    const a = point.x - x1;
    const b = point.y - y1;
    const c = x2 - x1;
    const d = y2 - y1;
    const dot = a * c + b * d;
    const lenSq = c * c + d * d;
    const param = lenSq ? dot / lenSq : -1;
    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * c;
      yy = y1 + param * d;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const findClosestPointOnLine = (
    line: Line,
    point: { x: number; y: number },
  ) => {
    const [x1, y1, x2, y2] = line.points;
    const a = point.x - x1;
    const b = point.y - y1;
    const c = x2 - x1;
    const d = y2 - y1;
    const dot = a * c + b * d;
    const lenSq = c * c + d * d;
    const param = lenSq ? dot / lenSq : -1;

    let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    if (param < 0) {
      return { x: x1, y: y1, angle };
    } else if (param > 1) {
      return { x: x2, y: y2, angle };
    } else {
      return { x: x1 + param * c, y: y1 + param * d, angle };
    }
  };

  const drawWallLength = (line: Line, index: number) => {
    const [x1, y1, x2, y2] = line.points;
    const lengthMeters = (
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 100
    ).toFixed(2);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return showDimensions ? (
      <>
        <Text
          key={`text-${index}`}
          text={`${lengthMeters} m`}
          x={midX}
          y={midY - 20}
          fontSize={16}
          fill="black"
        />
        <Arrow
          points={[x1, y1, x2, y2]}
          stroke="red"
          fill="red"
          pointerLength={15}
          pointerWidth={15}
          strokeWidth={2}
          tension={0.5}
        />
      </>
    ) : null;
  };

  const drawWallArrowAndLength = (line: Line, index: number) => {
    const [x1, y1, x2, y2] = line.points;
    const lengthInMeters = (
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / PIXELS_PER_METER
    ).toFixed(2);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
      <>
        <Arrow
          points={[x1, y1, x2, y2]}
          stroke="red"
          fill="red"
          pointerLength={10}
          pointerWidth={10}
        />
        <Text
          key={`text-${index}`}
          text={`${lengthInMeters} m`}
          x={midX}
          y={midY - 20}
          fontSize={16}
          fill="black"
        />
      </>
    );
  };

  return (
    <div className="noScroll">
      <div className="flex gap-4">
        <CustomButton variant="secondary" onClick={() => setTool("wall")}>
          Draw Wall
        </CustomButton>
        <CustomButton variant="secondary" onClick={() => setTool("window")}>
          Add Window
        </CustomButton>
        <CustomButton variant="secondary" onClick={() => setTool("door")}>
          Add Door
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={() => setShowDimensions(!showDimensions)}
        >
          {showDimensions ? "Hide Dimensions" : "Show Dimensions"}
        </CustomButton>
      </div>

      {isMounted && typeof window !== "undefined" && (
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {drawGrid()}
            {tempLine && (
              <KonvaLine
                points={tempLine.points}
                stroke="black"
                strokeWidth={8}
                dash={[10, 5]}
              />
            )}
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                <KonvaLine
                  points={line.points}
                  stroke="black"
                  strokeWidth={8}
                />
                {drawWallLength(line, i)}
              </React.Fragment>
            ))}
            {shapes.map((shape, i) => (
              <React.Fragment key={i}>
                <KonvaImage
                  image={shape.image}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  rotation={shape.rotation}
                  onClick={() => setSelectedShape(i)}
                />
                {selectedShape === i && (
                  <>
                    <Circle
                      x={shape.x + shape.width + 20}
                      y={shape.y + shape.height / 2}
                      radius={10}
                      fill="red"
                      draggable
                      onClick={() => rotateShape(i)}
                    />
                    <Circle
                      x={shape.x + shape.width + 40}
                      y={shape.y + shape.height / 2}
                      radius={10}
                      fill="blue"
                      onClick={() => deleteShape(i)}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default PlanEditor;
