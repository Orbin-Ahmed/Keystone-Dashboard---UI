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
import { Line, PlanEditorProps, ShapeType } from "@/types";
import { uid } from "uid";

const GRID_SIZE = 50;
const PIXELS_PER_METER = 100;
const SNAP_THRESHOLD = 10;
const MIN_WALL_LENGTH = 0.1 * PIXELS_PER_METER;
const STRAIGHT_LINE_THRESHOLD = 10;
const width = 5000;
const height = 3000;

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
  roomNames,
  setRoomNames,
  addRoomName,
  editRoomName,
  deleteRoomName,
}: PlanEditorProps) => {
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [tempLine, setTempLine] = useState<Line | null>(null);
  const [guideLine, setGuideLine] = useState<Line | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [rotateIcon] = useImage("/icons/rotate.svg");
  const [deleteIcon] = useImage("/icons/delete.svg");
  const [editIcon] = useImage("/icons/edit.svg");

  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    setIsMounted(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTool(null);
        setSelectedShape(null);
        setSelectedWall(null);
        setGuideLine(null);
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

  const findClosestLineById = (pos: {
    x: number;
    y: number;
  }): string | null => {
    let closestLineId: string | null = null;
    let minDist = Infinity;

    lines.forEach((line) => {
      const dist = distanceToLine(line, pos);
      if (dist < minDist) {
        minDist = dist;
        closestLineId = line.id;
      }
    });

    return closestLineId;
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
    if (!pos) return;

    if (tool === "wall") {
      const snappedPos = getSnappedPosition(pos);
      setStartPoint(snappedPos);
    } else if (tool === "window" || tool === "door") {
      const closestLineId = findClosestLineById(pos);
      if (closestLineId) {
        const closestLine = lines.find((line) => line.id === closestLineId);
        if (closestLine && isClickOnWall(closestLine, pos)) {
          const { x, y, angle } = findClosestPointOnLine(closestLine, pos);
          addShape(tool, x, y, angle, closestLineId);
        }
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "wall" && startPoint) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const snappedPos = getSnappedPosition(pos);
        const constrainedPos = getDynamicConstrainedPosition(
          snappedPos,
          startPoint,
        );
        setTempLine({
          id: "temp",
          points: [
            startPoint.x,
            startPoint.y,
            constrainedPos.x,
            constrainedPos.y,
          ],
          thickness: 8,
        });

        const guide = getGuideLine(constrainedPos);
        if (guide) {
          setGuideLine({
            id: "guide",
            points: guide.points,
            thickness: 1,
          });
        } else {
          setGuideLine(null);
        }
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage || !startPoint) return;

    if (tool === "wall") {
      const pos = stage.getPointerPosition();
      if (pos) {
        const snappedPos = getSnappedPosition(pos);
        const constrainedPos = getDynamicConstrainedPosition(
          snappedPos,
          startPoint,
        );

        if (
          startPoint.x === constrainedPos.x &&
          startPoint.y === constrainedPos.y
        ) {
          setStartPoint(null);
          setTempLine(null);
          setGuideLine(null);
          return;
        }

        const newLinePoints = [
          startPoint.x,
          startPoint.y,
          constrainedPos.x,
          constrainedPos.y,
        ];

        const length = Math.sqrt(
          (constrainedPos.x - startPoint.x) ** 2 +
            (constrainedPos.y - startPoint.y) ** 2,
        );

        if (length >= MIN_WALL_LENGTH - 0.01) {
          const newLine: Line = {
            id: uid(16),
            points: newLinePoints,
            thickness: 8,
          };
          setLines([...lines, newLine]);
        }

        setStartPoint(null);
        setTempLine(null);
        setGuideLine(null);
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

  const getDynamicConstrainedPosition = (
    pos: { x: number; y: number },
    start: { x: number; y: number },
  ) => {
    const dx = pos.x - start.x;
    const dy = pos.y - start.y;

    if (Math.abs(dx) < STRAIGHT_LINE_THRESHOLD) {
      return { x: start.x, y: pos.y };
    } else if (Math.abs(dy) < STRAIGHT_LINE_THRESHOLD) {
      return { x: pos.x, y: start.y };
    } else {
      return pos;
    }
  };

  const getGuideLine = (pos: { x: number; y: number }) => {
    for (let line of lines) {
      const [x1, y1, x2, y2] = line.points;

      if (
        Math.abs(pos.x - x1) < STRAIGHT_LINE_THRESHOLD &&
        Math.abs(y1 - y2) < STRAIGHT_LINE_THRESHOLD
      ) {
        return {
          points: [x1, Math.min(y1, y2), x1, Math.max(startPoint!.y, pos.y)],
        };
      } else if (
        Math.abs(pos.y - y1) < STRAIGHT_LINE_THRESHOLD &&
        Math.abs(x1 - x2) < STRAIGHT_LINE_THRESHOLD
      ) {
        return {
          points: [Math.min(x1, x2), y1, Math.max(startPoint!.x, pos.x), y1],
        };
      }
    }
    return null;
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
    wallId: string,
  ) => {
    const image = shapeType === "window" ? windowImage : doorImage;
    const isWindow = shapeType === "window";
    const wall = lines.find((line) => line.id === wallId);

    if (!wall) return;

    const [x1, y1, x2, y2] = wall.points;
    const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const windowWidth = 70;
    const windowHeight = 8;
    const doorWidth = 40;
    const doorHeight = 60;

    let newShape: ShapeType;

    if (isWindow) {
      const angleRadians = (angle * Math.PI) / 180;
      const adjustedX = x - (windowHeight / 2) * Math.sin(angleRadians);
      const adjustedY = y + (windowHeight / 2) * Math.cos(angleRadians);

      newShape = {
        id: uid(16),
        type: "window",
        x: adjustedX,
        y: adjustedY,
        width: windowWidth,
        height: windowHeight,
        image,
        rotation: (angle + 180) % 360,
        wallId,
      };
    } else {
      newShape = {
        id: uid(16),
        type: "door",
        x,
        y,
        width: doorWidth,
        height: doorHeight,
        image,
        rotation: angle,
        wallId,
      };
    }

    setShapes([...shapes, newShape]);
  };

  const deleteShape = (shapeId: string) => {
    setShapes(shapes.filter((shape) => shape.id !== shapeId));
    setSelectedShape(null);
  };

  const rotateShape = (shapeId: string) => {
    setShapes(
      shapes.map((shape) =>
        shape.id === shapeId
          ? { ...shape, rotation: (shape.rotation || 0) + 90 }
          : shape,
      ),
    );
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

  const drawWallLength = (line: Line, index: string) => {
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

  const updateWall = (wallId: string, dx: number, dy: number) => {
    const updatedLines = lines.map((line) => {
      if (line.id === wallId) {
        const oldPoints = line.points;
        return {
          ...line,
          points: [
            oldPoints[0] + dx,
            oldPoints[1] + dy,
            oldPoints[2] + dx,
            oldPoints[3] + dy,
          ],
        };
      }
      return line;
    });

    const updatedShapes = shapes.map((shape) => {
      if (shape.wallId === wallId) {
        return {
          ...shape,
          x: shape.x + dx,
          y: shape.y + dy,
        };
      }
      return shape;
    });

    setLines(updatedLines);
    setShapes(updatedShapes);
  };

  const handleShapeDragEnd = (
    e: Konva.KonvaEventObject<DragEvent>,
    shapeId: string,
  ) => {
    const pos = e.target.position();
    const closestLineId = findClosestLineById(pos);
    const shape = shapes.find((s) => s.id === shapeId);

    if (!shape) return;

    if (closestLineId) {
      const closestLine = lines.find((line) => line.id === closestLineId);
      if (closestLine && isClickOnWall(closestLine, pos)) {
        const { x, y, angle } = findClosestPointOnLine(closestLine, pos);
        const isWindow = shape.type === "window";

        let adjustedX = x;
        let adjustedY = y;
        let shapeRotation = angle;

        if (isWindow) {
          const windowHeight = shape.height;
          const angleRadians = (angle * Math.PI) / 180;
          adjustedX = x - (windowHeight / 2) * Math.sin(angleRadians);
          adjustedY = y + (windowHeight / 2) * Math.cos(angleRadians);
          shapeRotation = (angle + 180) % 360;
        }

        setShapes(
          shapes.map((s) =>
            s.id === shapeId
              ? {
                  ...s,
                  x: adjustedX,
                  y: adjustedY,
                  rotation: isWindow ? shapeRotation : angle,
                  wallId: closestLineId,
                }
              : s,
          ),
        );
      } else {
        e.target.position({ x: shape.x, y: shape.y });
      }
    } else {
      e.target.position({ x: shape.x, y: shape.y });
    }
  };

  const deleteWall = (wallId: string) => {
    setLines(lines.filter((line) => line.id !== wallId));
    setShapes(shapes.filter((shape) => shape.wallId !== wallId));
    setSelectedWall(null);
  };

  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (pos) {
      const name = prompt("Enter room name:");
      if (name) {
        addRoomName(pos.x, pos.y, name);
      }
    }
  };

  return (
    <div className="canvas-container">
      {isMounted && typeof window !== "undefined" && (
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDblClick={handleDoubleClick}
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
            {guideLine && (
              <KonvaLine
                points={guideLine.points}
                stroke="blue"
                strokeWidth={1}
                dash={[5, 5]}
              />
            )}
            {lines.map((line) => (
              <React.Fragment key={line.id}>
                <Group
                  draggable={tool === "moveWall"}
                  onClick={() => {
                    if (tool === "moveWall") {
                      setSelectedWall(line.id);
                      setSelectedShape(null);
                    }
                  }}
                  onDragEnd={(e) => {
                    const dx = e.target.x();
                    const dy = e.target.y();
                    updateWall(line.id, dx, dy);
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
                    stroke={selectedWall === line.id ? "blue" : "black"}
                    strokeWidth={line.thickness || 8}
                  />
                </Group>
                <Text
                  key={`id-${line.id}`}
                  text={`ID: ${line.id}`}
                  x={(line.points[0] + line.points[2]) / 2 - 20}
                  y={(line.points[1] + line.points[3]) / 2 - 20}
                  fontSize={14}
                  fill="grey"
                  rotation={
                    (Math.atan2(
                      line.points[3] - line.points[1],
                      line.points[2] - line.points[0],
                    ) *
                      180) /
                    Math.PI
                  }
                />
                {selectedWall === line.id && (
                  <KonvaImage
                    image={deleteIcon}
                    x={(line.points[0] + line.points[2]) / 2 - 10}
                    y={(line.points[1] + line.points[3]) / 2 - 30}
                    width={20}
                    height={20}
                    onClick={() => deleteWall(line.id)}
                  />
                )}
                {drawWallLength(line, line.id)}
              </React.Fragment>
            ))}
            {shapes.map((shape) => (
              <React.Fragment key={shape.id}>
                <KonvaImage
                  image={shape.image}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  rotation={shape.rotation}
                  onClick={() => {
                    setSelectedShape(shape.id);
                    setSelectedWall(null);
                  }}
                  draggable
                  onDragEnd={(e) => handleShapeDragEnd(e, shape.id)}
                />
                {selectedShape === shape.id && (
                  <>
                    {/* Replace Circles with Icons */}
                    <KonvaImage
                      image={rotateIcon}
                      x={shape.x + shape.width + 10}
                      y={shape.y + shape.height / 2 - 30}
                      width={20}
                      height={20}
                      onClick={() => rotateShape(shape.id)}
                    />
                    <KonvaImage
                      image={deleteIcon}
                      x={shape.x + shape.width + 10}
                      y={shape.y + shape.height / 2 + 10}
                      width={20}
                      height={20}
                      onClick={() => deleteShape(shape.id)}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
            {roomNames.map((room, index) => (
              <React.Fragment key={room.id}>
                <Text
                  text={room.name}
                  x={room.x}
                  y={room.y}
                  fontSize={18}
                  fontStyle="bold"
                  fill={selectedRoomId === room.id ? "red" : "black"}
                  draggable
                  align="center"
                  offsetX={room.offsetX || 0}
                  onDragEnd={(e) => {
                    const newRoomNames = [...roomNames];
                    newRoomNames[index] = {
                      ...newRoomNames[index],
                      x: e.target.x(),
                      y: e.target.y(),
                    };
                    setRoomNames(newRoomNames);
                  }}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setSelectedShape(null);
                    setSelectedWall(null);
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "pointer";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = "default";
                    }
                  }}
                />
                {selectedRoomId === room.id && (
                  <>
                    {/* Delete Icon */}
                    <KonvaImage
                      image={deleteIcon}
                      x={room.x + 20}
                      y={room.y - 20}
                      width={20}
                      height={20}
                      onClick={() => {
                        deleteRoomName(room.id);
                        setSelectedRoomId(null);
                      }}
                    />
                    {/* Edit Icon */}
                    <KonvaImage
                      image={editIcon}
                      x={room.x + 50}
                      y={room.y - 20}
                      width={20}
                      height={20}
                      onClick={() => {
                        const newName = prompt(
                          "Enter new room name:",
                          room.name,
                        );
                        if (newName) {
                          editRoomName(room.id, newName); // Use editRoomName function
                          setSelectedRoomId(null);
                        }
                      }}
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
