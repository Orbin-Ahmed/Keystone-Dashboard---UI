"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Line as KonvaLine,
  Image as KonvaImage,
  Arrow,
  Group,
} from "react-konva";
import useImage from "use-image";
import { Text } from "react-konva";
import Konva from "konva";
import { Line, PlanEditorProps } from "@/types";

interface Shape {
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  image: HTMLImageElement;
  wallIndex?: number;
}

const GRID_SIZE = 50;
const PIXELS_PER_METER = 100;
const SNAP_THRESHOLD = 20;

const PlanEditor = ({
  tool,
  setTool,
  showDimensions,
  setShowDimensions,
  selectedShape,
  setSelectedShape,
  selectedWall,
  setSelectedWall,
  shapes,
  setShapes,
  lines,
  setLines,
  windowImage,
  doorImage,
  viewMode,
}: PlanEditorProps) => {
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [tempLine, setTempLine] = useState<Line | null>(null);
  const [rotateIcon] = useImage("/icons/rotate.svg");
  const [deleteIcon] = useImage("/icons/delete.svg");

  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    setIsMounted(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTool(null);
        setSelectedShape(null);
        setSelectedWall(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setTool, setSelectedShape, setSelectedWall]);

  const drawGrid = () => {
    const lines = [];
    const gridSize = GRID_SIZE;
    const width = 2000; // Fixed canvas width
    const height = 2000; // Fixed canvas height

    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <KonvaLine
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="#ddd"
          strokeWidth={1}
        />,
      );
    }

    for (let j = 0; j <= height; j += gridSize) {
      lines.push(
        <KonvaLine
          key={`h-${j}`}
          points={[0, j, width, j]}
          stroke="#ddd"
          strokeWidth={1}
        />,
      );
    }

    return lines;
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedWall(null);
      setSelectedShape(null);
    }

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();

    if (tool === "wall" && pos) {
      const snappedPos = getSnappedPosition(pos);
      setStartPoint(snappedPos);
    } else if ((tool === "window" || tool === "door") && pos) {
      const closestLineIndex = findClosestLineIndex(pos);
      if (closestLineIndex !== null) {
        const closestLine = lines[closestLineIndex];
        if (isClickOnWall(closestLine, pos)) {
          const { x, y, angle } = findClosestPointOnLine(closestLine, pos);
          addShape(tool, x, y, angle, closestLineIndex);
        }
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "wall" && startPoint) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const snappedPos = getSnappedPosition(pos);
        setTempLine({
          points: [startPoint.x, startPoint.y, snappedPos.x, snappedPos.y],
        });
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (tool === "wall" && startPoint) {
      const pos = stage.getPointerPosition();
      if (pos) {
        const snappedPos = getSnappedPosition(pos);
        if (startPoint.x === snappedPos.x && startPoint.y === snappedPos.y) {
          setStartPoint(null);
          setTempLine(null);
          return;
        }

        const newLinePoints = [
          startPoint.x,
          startPoint.y,
          snappedPos.x,
          snappedPos.y,
        ];
        setLines([...lines, { points: newLinePoints }]);
        setStartPoint(null);
        setTempLine(null);
      }
    }
  };

  const getSnappedPosition = (pos: { x: number; y: number }) => {
    for (let line of lines) {
      const [x1, y1, x2, y2] = line.points;
      if (distance(pos, { x: x1, y: y1 }) < SNAP_THRESHOLD) {
        return { x: x1, y: y1 };
      }
      if (distance(pos, { x: x2, y: y2 }) < SNAP_THRESHOLD) {
        return { x: x2, y: y2 };
      }
    }
    return pos;
  };

  const distance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const addShape = (
    shapeType: "window" | "door",
    x: number,
    y: number,
    angle: number,
    wallIndex: number,
  ) => {
    const image = shapeType === "window" ? windowImage : doorImage;
    const isWindow = shapeType === "window";

    const line = lines[wallIndex];
    const [x1, y1, x2, y2] = line.points;
    const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    // Window Area
    const windowWidth = wallLength * 0.15;
    const windowHeight = 8;

    const offsetDistance = 0;
    const angleRadians = (angle * Math.PI) / 180;

    const adjustedX =
      x - (windowHeight / 2 + offsetDistance) * Math.sin(angleRadians);
    const adjustedY =
      y + (windowHeight / 2 + offsetDistance) * Math.cos(angleRadians);

    let shapeRotation = angle;
    if (isWindow) {
      shapeRotation = (angle + 180) % 360;
    }
    // Window Area End

    // Door Area
    const doorWidth = 40;
    const doorHeight = 60;

    const adjustedDoorY = isWindow ? y - windowHeight / 2 : y;
    // Door Area End

    if (image && !isWindow) {
      const newShape: Shape = {
        type: shapeType,
        x,
        y: adjustedDoorY,
        width: doorWidth,
        height: doorHeight,
        image,
        rotation: angle,
        wallIndex,
      };

      setShapes([...shapes, newShape]);
    } else if (image && isWindow) {
      const newShape: Shape = {
        type: shapeType,
        x: adjustedX,
        y: adjustedY,
        width: windowWidth,
        height: windowHeight,
        image,
        rotation: shapeRotation,
        wallIndex,
      };

      setShapes([...shapes, newShape]);
    }
  };

  const deleteShape = (index: number) => {
    const updatedShapes = [...shapes];
    updatedShapes.splice(index, 1);
    setShapes(updatedShapes);
    setSelectedShape(null);
  };

  const rotateShape = (index: number) => {
    const updatedShapes = [...shapes];
    updatedShapes[index].rotation = (updatedShapes[index].rotation || 0) + 90;
    setShapes(updatedShapes);
  };

  const findClosestLineIndex = (pos: {
    x: number;
    y: number;
  }): number | null => {
    let closestLineIndex: number | null = null;
    let minDist = Infinity;

    lines.forEach((line, index) => {
      const dist = distanceToLine(line, pos);
      if (dist < minDist) {
        minDist = dist;
        closestLineIndex = index;
      }
    });

    return closestLineIndex;
  };

  const isClickOnWall = (line: Line, point: { x: number; y: number }) => {
    const threshold = 10;
    return distanceToLine(line, point) < threshold;
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

    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    if (param < 0) {
      return { x: x1, y: y1, angle };
    } else if (param > 1) {
      return { x: x2, y: y2, angle };
    } else {
      return { x: x1 + param * c, y: y1 + param * d, angle };
    }
  };

  const distanceToLine = (line: Line, point: { x: number; y: number }) => {
    const [x1, y1, x2, y2] = line.points;
    const a = point.x - x1;
    const b = point.y - y1;
    const c = x2 - x1;
    const d = y2 - y1;
    const dot = a * c + b * d;
    const lenSq = c * c + d * d;

    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

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

  const drawWallLength = (line: Line, index: number) => {
    const [x1, y1, x2, y2] = line.points;
    const lengthMeters = (
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / PIXELS_PER_METER
    ).toFixed(2);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const offset = -20;
    let offsetX = 0;
    let offsetY = 0;

    if (len !== 0) {
      offsetX = (-dy / len) * offset;
      offsetY = (dx / len) * offset;
    }

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    let textOffsetX = 20;
    let textOffsetY = 20;

    if (angle > 90) {
      angle -= 180;
      textOffsetX = 0;
      textOffsetY = -10;
    } else if (angle < -90) {
      angle += 180;
      textOffsetY = -10;
    }

    return showDimensions ? (
      <>
        <Text
          key={`text-${index}`}
          text={`${lengthMeters} m`}
          x={midX + offsetX}
          y={midY + offsetY}
          rotation={angle}
          offsetX={textOffsetX}
          offsetY={textOffsetY}
          fontSize={16}
          fill="black"
        />
        <Arrow
          points={[x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY]}
          stroke="red"
          fill="red"
          pointerLength={15}
          pointerWidth={15}
          strokeWidth={2}
          tension={0.5}
          pointerAtBeginning={true}
        />
      </>
    ) : null;
  };

  const updateWall = (index: number, dx: number, dy: number) => {
    const updatedLines = [...lines];
    const oldPoints = updatedLines[index].points;
    const newPoints = [
      oldPoints[0] + dx,
      oldPoints[1] + dy,
      oldPoints[2] + dx,
      oldPoints[3] + dy,
    ];
    updatedLines[index].points = newPoints;
    setLines(updatedLines);

    const updatedShapes = shapes.map((shape) => {
      if (shape.wallIndex === index) {
        return {
          ...shape,
          x: shape.x + dx,
          y: shape.y + dy,
        };
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  const handleShapeDragEnd = (
    e: Konva.KonvaEventObject<DragEvent>,
    index: number,
  ) => {
    const pos = e.target.position();
    const closestLineIndex = findClosestLineIndex(pos);

    if (closestLineIndex !== null) {
      const closestLine = lines[closestLineIndex];
      if (isClickOnWall(closestLine, pos)) {
        const { x, y, angle } = findClosestPointOnLine(closestLine, pos);
        const updatedShapes = [...shapes];
        const isWindow = updatedShapes[index].type === "window";

        // Adjust position and rotation for window to align properly
        let adjustedX = x;
        let adjustedY = y;
        let shapeRotation = angle;

        if (isWindow) {
          const windowHeight = updatedShapes[index].height;
          const angleRadians = (angle * Math.PI) / 180;

          adjustedX = x - (windowHeight / 2) * Math.sin(angleRadians);
          adjustedY = y + (windowHeight / 2) * Math.cos(angleRadians);

          shapeRotation = (angle + 180) % 360;
        }

        updatedShapes[index] = {
          ...updatedShapes[index],
          x: adjustedX,
          y: adjustedY,
          rotation: isWindow ? shapeRotation : angle,
          wallIndex: closestLineIndex,
        };
        setShapes(updatedShapes);
      } else {
        e.target.position({ x: shapes[index].x, y: shapes[index].y });
      }
    } else {
      e.target.position({ x: shapes[index].x, y: shapes[index].y });
    }
  };

  const deleteWall = (index: number) => {
    const updatedLines = [...lines];
    updatedLines.splice(index, 1);
    setLines(updatedLines);
    setSelectedWall(null);

    // Remove shapes attached to this wall
    const updatedShapes = shapes.filter((shape) => shape.wallIndex !== index);
    setShapes(updatedShapes);
  };

  return (
    <div className="canvas-container">
      {isMounted && typeof window !== "undefined" && (
        <Stage
          width={2000} // Fixed canvas width
          height={2000} // Fixed canvas height
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {drawGrid()}
            {tempLine && (
              <KonvaLine
                points={tempLine.points}
                stroke="black"
                strokeWidth={2}
                dash={[10, 5]}
              />
            )}
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                <Group
                  draggable={tool === "moveWall"}
                  onClick={() => {
                    if (tool === "moveWall") {
                      setSelectedWall(i);
                      setSelectedShape(null);
                    }
                  }}
                  onDragEnd={(e) => {
                    const dx = e.target.x();
                    const dy = e.target.y();
                    updateWall(i, dx, dy);
                    e.target.position({ x: 0, y: 0 });
                  }}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (stage) {
                      stage.container().style.cursor =
                        tool === "moveWall" ? "move" : "pointer";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (stage) {
                      stage.container().style.cursor = "default";
                    }
                  }}
                >
                  <KonvaLine
                    points={line.points}
                    stroke={selectedWall === i ? "blue" : "black"}
                    strokeWidth={line.thickness || 8}
                  />
                </Group>
                {selectedWall === i && (
                  <KonvaImage
                    image={deleteIcon}
                    x={(line.points[0] + line.points[2]) / 2 - 10}
                    y={(line.points[1] + line.points[3]) / 2 - 30}
                    width={20}
                    height={20}
                    onClick={() => deleteWall(i)}
                  />
                )}
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
                  onClick={() => {
                    setSelectedShape(i);
                    setSelectedWall(null);
                  }}
                  draggable
                  onDragEnd={(e) => handleShapeDragEnd(e, i)}
                />
                {selectedShape === i && (
                  <>
                    {/* Replace Circles with Icons */}
                    <KonvaImage
                      image={rotateIcon}
                      x={shape.x + shape.width + 10}
                      y={shape.y + shape.height / 2 - 30}
                      width={20}
                      height={20}
                      onClick={() => rotateShape(i)}
                    />
                    <KonvaImage
                      image={deleteIcon}
                      x={shape.x + shape.width + 10}
                      y={shape.y + shape.height / 2 + 10}
                      width={20}
                      height={20}
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
