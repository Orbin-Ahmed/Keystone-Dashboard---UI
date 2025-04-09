"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Line as KonvaLine,
  Image as KonvaImage,
  Arrow,
  Group,
  Circle,
} from "react-konva";
import useImage from "use-image";
import { Text } from "react-konva";
import Konva from "konva";
import {
  CeilingItem,
  FurnitureItem,
  Line,
  PlanEditorProps,
  ShapeType,
  SidebarItem,
  WallItems2D,
} from "@/types";
import { uid } from "uid";
import FurnitureItemComponent from "./FurnitureItemComponent";

const GRID_SIZE = 50;
const PIXELS_PER_METER = 0.398;
const SNAP_THRESHOLD = 10;
const MIN_WALL_LENGTH = 0.1 * PIXELS_PER_METER;
const STRAIGHT_LINE_THRESHOLD = 10;
const width = 5000;
const height = 3000;

interface TempLine extends Line {
  length?: string;
  textAngle?: number;
  midPoint?: {
    x: number;
    y: number;
  };
}

interface HelperLine {
  start: { x: number; y: number };
  end: { x: number; y: number };
  distance: number;
  type: "item" | "wall";
}

const PlanEditor = ({
  tool,
  setTool,
  showDimensions,
  setShowDimensions,
  selectedShape,
  setSelectedShape,
  selectedWall,
  setSelectedWall,
  windowImage,
  doorImage,
  shapes,
  setShapes,
  lines,
  setLines,
  floorPlanPoints,
  setFloorPlanPoints,
  furnitureItems,
  setFurnitureItems,
  ceilingItems,
  setCeilingItems,
  wallItems,
  setWallItems,
  roomNames,
  setRoomNames,
  addRoomName,
  editRoomName,
  deleteRoomName,
  isSidebarOpen,
  selectedPlane,
}: PlanEditorProps) => {
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
  // const [tempLine, setTempLine] = useState<Line | null>(null);
  const [tempLine, setTempLine] = useState<TempLine | null>(null);
  const [guideLine, setGuideLine] = useState<Line | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedFloorPoint, setSelectedFloorPoint] = useState<string | null>(
    null,
  );

  // const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  // const [selectedCeilingItemId, setSelectedCeilingItemId] = useState<
  //   string | null
  // >(null);
  // const [selectedWallItemId, setSelectedWallItemId] = useState<string | null>(
  //   null,
  // );

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedCeilingItemIds, setSelectedCeilingItemIds] = useState<
    string[]
  >([]);
  const [selectedWallItemIds, setSelectedWallItemIds] = useState<string[]>([]);

  const [scale, setScale] = useState(1);

  const [helperLines, setHelperLines] = useState<HelperLine[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateItemId, setDuplicateItemId] = useState<string | null>(null);

  const [rotateIcon] = useImage("/icons/rotate.svg");
  const [deleteIcon] = useImage("/icons/delete.svg");
  const [editIcon] = useImage("/icons/edit.svg");

  const stageRef = useRef<Konva.Stage>(null);

  const DIMMED_OPACITY = 0.3;
  const FULL_OPACITY = 1;

  const floorLayerOpacity =
    selectedPlane === "roof"
      ? DIMMED_OPACITY
      : selectedPlane === "wall"
        ? DIMMED_OPACITY
        : FULL_OPACITY;
  const ceilingLayerOpacity =
    selectedPlane === "roof"
      ? FULL_OPACITY
      : selectedPlane === "wall"
        ? DIMMED_OPACITY
        : 0;
  const wallLayerOpacity = selectedPlane === "wall" ? FULL_OPACITY : 0;

  const floorLayerListening = selectedPlane === "floor";
  const ceilingLayerListening = selectedPlane === "roof";
  const wallLayerListening = selectedPlane === "wall";

  useEffect(() => {
    setIsMounted(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        document.dispatchEvent(new CustomEvent("editor-undo"));
      } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        document.dispatchEvent(new CustomEvent("editor-redo"));
      } else if (event.key === "Shift") {
        setIsShiftPressed(true);
      } else if (event.key === "Escape") {
        setTool(null);
        setSelectedShape(null);
        setSelectedWall(null);
        setGuideLine(null);
        setSelectedItemIds([]);
        setSelectedCeilingItemIds([]);
        setSelectedWallItemIds([]);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedItemIds.length > 0) {
          setFurnitureItems((prev) =>
            prev.filter((f) => !selectedItemIds.includes(f.id)),
          );
          setSelectedItemIds([]);
        } else if (selectedCeilingItemIds.length > 0) {
          setCeilingItems((prev) =>
            prev.filter((c) => !selectedCeilingItemIds.includes(c.id)),
          );
          setSelectedCeilingItemIds([]);
        } else if (selectedWallItemIds.length > 0) {
          setWallItems((prev) =>
            prev.filter((i) => !selectedWallItemIds.includes(i.id)),
          );
          setSelectedWallItemIds([]);
        }
      } else if (event.key === "i") {
        setTool("wall");
      } else if (event.key === "d") {
        setTool("door");
      } else if (event.key === "w") {
        setTool("window");
      } else if (event.key === "p") {
        setTool("floorPoint");
      } else if (event.key === "m") {
        setTool("moveWall");
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);

        if (isDuplicating) {
          setIsDuplicating(false);
          setDuplicateItemId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    setTool,
    setSelectedShape,
    setSelectedWall,
    selectedItemIds,
    selectedCeilingItemIds,
    selectedWallItemIds,
  ]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    let newScale = oldScale;
    if (e.evt.deltaY < 0) {
      newScale = oldScale * scaleBy;
    } else {
      newScale = oldScale / scaleBy;
    }
    setScale(newScale);

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  // Snap helper

  const autoJoinLines = (lines: Line[]): Line[] => {
    const JOIN_THRESHOLD = 20;
    const updatedLines = lines.map((line) => ({
      ...line,
      points: [...line.points],
    }));
    for (let i = 0; i < updatedLines.length; i++) {
      let [x1, y1, x2, y2] = updatedLines[i].points;
      for (let j = 0; j < updatedLines.length; j++) {
        if (i === j) continue;
        const line2 = updatedLines[j];
        let [ax1, ay1, ax2, ay2] = line2.points;
        if (distance({ x: x1, y: y1 }, { x: ax1, y: ay1 }) < JOIN_THRESHOLD) {
          x1 = ax1;
          y1 = ay1;
          line2.points = [ax1, ay1, ax2, ay2];
        } else if (
          distance({ x: x1, y: y1 }, { x: ax2, y: ay2 }) < JOIN_THRESHOLD
        ) {
          x1 = ax2;
          y1 = ay2;
          line2.points = [ax1, ay1, ax2, ay2];
        }
        if (distance({ x: x2, y: y2 }, { x: ax1, y: ay1 }) < JOIN_THRESHOLD) {
          x2 = ax1;
          y2 = ay1;
          line2.points = [ax1, ay1, ax2, ay2];
        } else if (
          distance({ x: x2, y: y2 }, { x: ax2, y: ay2 }) < JOIN_THRESHOLD
        ) {
          x2 = ax2;
          y2 = ay2;
          line2.points = [ax1, ay1, ax2, ay2];
        }
      }
      updatedLines[i].points = [x1, y1, x2, y2];
    }
    return updatedLines;
  };

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

  const addFloorPlanPoint = (x: number, y: number) => {
    setFloorPlanPoints((prevPoints) => [...prevPoints, { id: uid(), x, y }]);
  };

  const deleteFloorPlanPoint = (pointId: string) => {
    setFloorPlanPoints((prevPoints) =>
      prevPoints.filter((point) => point.id !== pointId),
    );
    setSelectedFloorPoint(null);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedPlane === "roof" || selectedPlane === "wall") return;
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedWall(null);
      setSelectedShape(null);
    }

    const stage = e.target.getStage();
    if (!stage) return;

    // const pos = stage.getPointerPosition();
    // if (!pos) return;

    const pos = getRelativePointerPosition(stage);

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
    } else if (tool === "floorPoint") {
      addFloorPlanPoint(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedPlane === "roof" || selectedPlane === "wall") return;
    if (tool === "wall" && startPoint) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const snappedPos = getSnappedPosition(pos);
        const constrainedPos = getDynamicConstrainedPosition(
          snappedPos,
          startPoint,
        );

        const lengthPixels = Math.sqrt(
          Math.pow(constrainedPos.x - startPoint.x, 2) +
            Math.pow(constrainedPos.y - startPoint.y, 2),
        );
        const lengthMeters = (lengthPixels / PIXELS_PER_METER).toFixed(2);
        const dx = constrainedPos.x - startPoint.x;
        const dy = constrainedPos.y - startPoint.y;
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle > 90) angle -= 180;
        if (angle < -90) angle += 180;

        setTempLine({
          id: "temp",
          points: [
            startPoint.x,
            startPoint.y,
            constrainedPos.x,
            constrainedPos.y,
          ],
          thickness: 8,
          length: lengthMeters,
          textAngle: angle,
          midPoint: {
            x: (startPoint.x + constrainedPos.x) / 2,
            y: (startPoint.y + constrainedPos.y) / 2,
          },
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
    if (selectedPlane === "roof" || selectedPlane === "wall") return;
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
          const newLines = [...lines, newLine];
          const joinedLines = autoJoinLines(newLines);
          setLines([...lines, newLine]);
          // setLines(joinedLines);
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

    const windowWidth = 70;
    const windowHeight = 8;
    const doorWidth = 40;
    const doorHeight = 40;

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
    const [x1, y1, x2, y2] = line.points;
    const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const threshold = Math.max(10, 0.05 * wallLength);
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
          text={`${lengthMeters} cm`}
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
          const windowHeight = 8;
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
    if (selectedPlane === "roof" || selectedPlane === "wall") return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const closestLineId = findClosestLineById(pos);

    if (closestLineId) {
      const wall = lines.find((line) => line.id === closestLineId);
      if (wall && isClickOnWall(wall, pos)) {
        const newLengthStr = prompt("Enter wall length in cm:");
        if (newLengthStr) {
          const newLengthCm = parseFloat(newLengthStr);
          if (!isNaN(newLengthCm)) {
            handleRescaleStructure(newLengthCm, closestLineId);
          } else {
            alert("Please enter a valid number.");
          }
        }
        return;
      }
    }

    if (pos) {
      const name = prompt("Enter room name:");
      if (name) {
        addRoomName(pos.x, pos.y, name);
      }
    }
  };

  const getRelativePointerPositionFromEvent = (
    stage: Konva.Stage,
    e: React.DragEvent<HTMLDivElement>,
  ): { x: number; y: number } => {
    const container = stage.container();
    const rect = container.getBoundingClientRect();
    const pointerPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pointerPos);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    // const rect = stage.container().getBoundingClientRect();
    // const pos = {
    //   x: e.clientX - rect.left,
    //   y: e.clientY - rect.top,
    // };

    const pos = getRelativePointerPositionFromEvent(stage, e);

    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;

    const itemData = dataTransfer.getData("application/json");
    if (!itemData) return;

    let item: SidebarItem;
    try {
      item = JSON.parse(itemData);
    } catch (error) {
      console.error("Invalid item data:", error);
      return;
    }

    if (selectedPlane === "wall") {
      const newWallItem: WallItems2D = {
        id: uid(),
        x: pos.x,
        y: pos.y,
        z: 50,
        name: item.name,
        width: item.width,
        height: item.height,
        depth: item.depth,
        rotation: 0,
        rotationX: 0,
        rotationZ: 0,
        imageSrc: item.imageSrc,
        category: item.category,
      };
      setWallItems((prev) => [...prev, newWallItem]);
    } else if (selectedPlane === "roof") {
      const newCeilingItem: CeilingItem = {
        id: uid(),
        x: pos.x,
        y: pos.y,
        z: 120 - 0.01 - item.height,
        name: item.name,
        width: item.width,
        height: item.height,
        depth: item.depth,
        rotation: 0,
        rotationX: 0,
        rotationZ: 0,
        imageSrc: item.imageSrc,
        category: item.category,
      };
      setCeilingItems((prev) => [...prev, newCeilingItem]);
    } else {
      const newFurniture: FurnitureItem = {
        id: uid(),
        x: pos.x,
        y: pos.y,
        z: 0,
        name: item.name,
        width: item.width,
        height: item.height,
        depth: item.depth,
        rotation: 0,
        rotationX: 0,
        rotationZ: 0,
        imageSrc: item.imageSrc,
        category: item.category,
      };
      setFurnitureItems((prev) => [...prev, newFurniture]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Create a handler for when dragging starts on a furniture item
  const handleDragStart = (id: string, isShiftKeyPressed: boolean) => {
    if (isShiftKeyPressed && !isDuplicating) {
      setIsDuplicating(true);

      const itemToDuplicate =
        furnitureItems.find((item) => item.id === id) ||
        ceilingItems.find((item) => item.id === id) ||
        wallItems.find((item) => item.id === id);

      if (itemToDuplicate) {
        const newId = uid();
        setDuplicateItemId(newId);

        if (
          selectedPlane === "roof" &&
          ceilingItems.some((item) => item.id === id)
        ) {
          const newItem: CeilingItem = {
            ...(itemToDuplicate as CeilingItem),
            id: newId,
          };
          setCeilingItems((prev) => [...prev, newItem]);
          setSelectedCeilingItemIds((prev) => [...prev, newId]);
        } else if (
          selectedPlane === "wall" &&
          wallItems.some((item) => item.id === id)
        ) {
          const newItem: WallItems2D = {
            ...(itemToDuplicate as WallItems2D),
            id: newId,
          };
          setWallItems((prev) => [...prev, newItem]);
          setSelectedWallItemIds((prev) => [...prev, newId]);
        } else {
          const newItem: FurnitureItem = {
            ...(itemToDuplicate as FurnitureItem),
            id: newId,
          };
          setFurnitureItems((prev) => [...prev, newItem]);
          setSelectedItemIds((prev) => [...prev, newId]);
        }
      }
    }
  };

  // helper function from distance line

  const getRelativePointerPosition = (
    stage: Konva.Stage,
  ): { x: number; y: number } => {
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) {
      return { x: 0, y: 0 };
    }
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pointerPos);
  };

  const getRotatedBoundingBox = (
    item: FurnitureItem,
  ): { left: number; right: number; top: number; bottom: number } => {
    const theta = (item.rotation * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const x = item.x;
    const y = item.y;
    const w = item.width;
    const h = item.depth;

    const p1 = { x, y };
    const p2 = { x: x + w * cos, y: y + w * sin };
    const p3 = { x: x - h * sin, y: y + h * cos };
    const p4 = { x: x + w * cos - h * sin, y: y + w * sin + h * cos };

    const xs = [p1.x, p2.x, p3.x, p4.x];
    const ys = [p1.y, p2.y, p3.y, p4.y];
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    };
  };

  const computeHelperLines = (
    draggedItem: FurnitureItem,
    otherItems: FurnitureItem[],
    wallLines: Line[],
  ): HelperLine[] => {
    const helperLines: HelperLine[] = [];

    const draggedBB = getRotatedBoundingBox(draggedItem);
    const left = draggedBB.left;
    const right = draggedBB.right;
    const top = draggedBB.top;
    const bottom = draggedBB.bottom;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const overlapTolerance = 10;

    otherItems.forEach((item) => {
      const otherBB = getRotatedBoundingBox(item);
      const candidateTop = otherBB.top;
      const candidateBottom = otherBB.bottom;
      const candidateLeft = otherBB.left;
      const candidateRight = otherBB.right;

      const overlapHeight =
        Math.min(bottom, candidateBottom) - Math.max(top, candidateTop);
      if (overlapHeight >= overlapTolerance) {
        if (candidateRight <= left) {
          const gap = left - candidateRight;
          helperLines.push({
            start: {
              x: candidateRight,
              y: Math.max(top, candidateTop) + overlapHeight / 2,
            },
            end: { x: left, y: centerY },
            distance: gap,
            type: "item",
          });
        }

        if (candidateLeft >= right) {
          const gap = candidateLeft - right;
          helperLines.push({
            start: { x: right, y: centerY },
            end: {
              x: candidateLeft,
              y: Math.max(top, candidateTop) + overlapHeight / 2,
            },
            distance: gap,
            type: "item",
          });
        }
      }

      const overlapWidth =
        Math.min(right, candidateRight) - Math.max(left, candidateLeft);
      if (overlapWidth >= overlapTolerance) {
        if (candidateBottom <= top) {
          const gap = top - candidateBottom;
          helperLines.push({
            start: {
              x: Math.max(left, candidateLeft) + overlapWidth / 2,
              y: candidateBottom,
            },
            end: { x: centerX, y: top },
            distance: gap,
            type: "item",
          });
        }

        if (candidateTop >= bottom) {
          const gap = candidateTop - bottom;
          helperLines.push({
            start: { x: centerX, y: bottom },
            end: {
              x: Math.max(left, candidateLeft) + overlapWidth / 2,
              y: candidateTop,
            },
            distance: gap,
            type: "item",
          });
        }
      }
    });

    wallLines.forEach((wall) => {
      const [x1, y1, x2, y2] = wall.points;
      if (Math.abs(x1 - x2) < 5) {
        const wallX = x1;
        if (wallX < left && !(y1 > bottom || y2 < top)) {
          const gap = left - wallX;
          helperLines.push({
            start: { x: wallX, y: centerY },
            end: { x: left, y: centerY },
            distance: gap,
            type: "wall",
          });
        }
        if (wallX > right && !(y1 > bottom || y2 < top)) {
          const gap = wallX - right;
          helperLines.push({
            start: { x: right, y: centerY },
            end: { x: wallX, y: centerY },
            distance: gap,
            type: "wall",
          });
        }
      }
      if (Math.abs(y1 - y2) < 5) {
        const wallY = y1;
        if (wallY < top && !(x1 > right || x2 < left)) {
          const gap = top - wallY;
          helperLines.push({
            start: { x: centerX, y: wallY },
            end: { x: centerX, y: top },
            distance: gap,
            type: "wall",
          });
        }
        if (wallY > bottom && !(x1 > right || x2 < left)) {
          const gap = wallY - bottom;
          helperLines.push({
            start: { x: centerX, y: bottom },
            end: { x: centerX, y: wallY },
            distance: gap,
            type: "wall",
          });
        }
      }
    });

    return helperLines;
  };

  const handleFurnitureDragMove = (
    id: string,
    newAttrs: { x: number; y: number },
  ) => {
    const draggedItem = furnitureItems.find((f) => f.id === id);
    if (!draggedItem) return;

    const updatedItem = { ...draggedItem, ...newAttrs };

    const otherItems = furnitureItems.filter((f) => f.id !== id);
    const newHelperLines = computeHelperLines(updatedItem, otherItems, lines);
    setHelperLines(newHelperLines);

    setFurnitureItems((prev) =>
      prev.map((f) => (f.id === id ? updatedItem : f)),
    );
  };

  const handleFurnitureDragEnd = (id: string) => {
    setHelperLines([]);
  };

  // Rescale Function

  const scalePoint = (old: number, pivot: number, scaleFactor: number) =>
    pivot + (old - pivot) * scaleFactor;

  const handleRescaleStructure = (
    desiredWallLengthCm: number,
    referenceWallId: string,
  ) => {
    const referenceWall = lines.find((line) => line.id === referenceWallId);
    if (!referenceWall) return;

    const [x1, y1, x2, y2] = referenceWall.points;
    const currentLengthPixels = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const currentLengthCm = currentLengthPixels / PIXELS_PER_METER;

    const scaleFactor = desiredWallLengthCm / currentLengthCm;

    const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
    const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);
    const pivot = {
      x: (Math.min(...allX) + Math.max(...allX)) / 2,
      y: (Math.min(...allY) + Math.max(...allY)) / 2,
    };

    setLines((prevLines) =>
      prevLines.map((line) => ({
        ...line,
        points: line.points.map((p, i) =>
          i % 2 === 0
            ? scalePoint(p, pivot.x, scaleFactor)
            : scalePoint(p, pivot.y, scaleFactor),
        ) as [number, number, number, number],
      })),
    );

    setShapes((prevShapes) =>
      prevShapes.map((shape) => ({
        ...shape,
        x: scalePoint(shape.x, pivot.x, scaleFactor),
        y: scalePoint(shape.y, pivot.y, scaleFactor),
      })),
    );

    setFloorPlanPoints((prevPoints) =>
      prevPoints.map((pt) => ({
        ...pt,
        x: scalePoint(pt.x, pivot.x, scaleFactor),
        y: scalePoint(pt.y, pivot.y, scaleFactor),
      })),
    );

    setFurnitureItems([]);
    setCeilingItems([]);
    setWallItems([]);
  };

  return (
    <div
      className="canvas-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isMounted && typeof window !== "undefined" && (
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDblClick={handleDoubleClick}
          ref={stageRef}
          onWheel={handleWheel}
          draggable={tool === null}
          onDragStart={(e) => {
            const container = stageRef.current?.container();
            if (container) {
              container.style.cursor = "grabbing";
            }
          }}
          onDragEnd={(e) => {
            const container = stageRef.current?.container();
            if (container) {
              container.style.cursor = "grab";
            }
          }}
        >
          <Layer opacity={floorLayerOpacity} listening={floorLayerListening}>
            {drawGrid()}
            {tempLine && tempLine.midPoint && (
              <>
                <KonvaLine
                  points={tempLine.points}
                  stroke="black"
                  strokeWidth={2}
                  dash={[10, 5]}
                />
                <Text
                  text={`${tempLine.length} cm`}
                  x={tempLine.midPoint.x}
                  y={tempLine.midPoint.y}
                  rotation={tempLine.textAngle}
                  fontSize={16}
                  fill="black"
                  offsetX={20}
                  offsetY={20}
                />
              </>
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
                {selectedWall === line.id && (
                  <>
                    <KonvaImage
                      image={deleteIcon}
                      x={(line.points[0] + line.points[2]) / 2 - 10}
                      y={(line.points[1] + line.points[3]) / 2 - 30}
                      width={20}
                      height={20}
                      onClick={() => deleteWall(line.id)}
                    />
                    <Circle
                      x={line.points[0]}
                      y={line.points[1]}
                      radius={8}
                      fill="blue"
                      draggable
                      onDragEnd={(e) => {
                        const newPos = { x: e.target.x(), y: e.target.y() };
                        const snapped = getSnappedPosition(newPos);
                        const updatedLine = {
                          ...line,
                          points: [
                            snapped.x,
                            snapped.y,
                            line.points[2],
                            line.points[3],
                          ],
                        };
                        const updatedLines = lines.map((l) =>
                          l.id === line.id ? updatedLine : l,
                        );
                        setLines(autoJoinLines(updatedLines));
                      }}
                    />
                    <Circle
                      x={line.points[2]}
                      y={line.points[3]}
                      radius={8}
                      fill="blue"
                      draggable
                      onDragEnd={(e) => {
                        const newPos = { x: e.target.x(), y: e.target.y() };
                        const snapped = getSnappedPosition(newPos);
                        const updatedLine = {
                          ...line,
                          points: [
                            line.points[0],
                            line.points[1],
                            snapped.x,
                            snapped.y,
                          ],
                        };
                        const updatedLines = lines.map((l) =>
                          l.id === line.id ? updatedLine : l,
                        );
                        setLines(autoJoinLines(updatedLines));
                      }}
                    />
                  </>
                )}
                {drawWallLength(line, line.id)}
                {/* <Text
                  text={`ID: ${line.id}`}
                  x={(line.points[0] + line.points[2]) / 2}
                  y={(line.points[1] + line.points[3]) / 2 - 20}
                  fontSize={14}
                  fill="gray"
                  align="center"
                /> */}
              </React.Fragment>
            ))}

            {shapes.map((shape) => (
              <React.Fragment key={shape.id}>
                <KonvaImage
                  image={shape.image}
                  x={shape.x}
                  y={shape.y}
                  width={shape.type === "door" ? 40 : 70}
                  // width={shape.width}
                  height={shape.type === "door" ? 40 : 8}
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

            {floorPlanPoints.map((point) => (
              <Group
                draggable={tool === "floorPoint"}
                key={point.id}
                x={point.x}
                y={point.y}
                onDragEnd={(e) => {
                  const newX = e.target.x();
                  const newY = e.target.y();
                  setFloorPlanPoints((prevPoints) =>
                    prevPoints.map((p) =>
                      p.id === point.id ? { ...p, x: newX, y: newY } : p,
                    ),
                  );
                }}
                onClick={() => {
                  setSelectedFloorPoint(point.id);
                  setSelectedShape(null);
                  setSelectedWall(null);
                }}
              >
                <Circle
                  x={0}
                  y={0}
                  radius={5}
                  fill="red"
                  stroke="black"
                  strokeWidth={2}
                />
                {selectedFloorPoint === point.id && (
                  <KonvaImage
                    image={deleteIcon}
                    x={10}
                    y={-10}
                    width={20}
                    height={20}
                    onClick={() => deleteFloorPlanPoint(point.id)}
                  />
                )}
              </Group>
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
                          editRoomName(room.id, newName);
                          setSelectedRoomId(null);
                        }
                      }}
                    />
                  </>
                )}
              </React.Fragment>
            ))}

            {furnitureItems.map((item) => (
              <FurnitureItemComponent
                key={item.id}
                item={item}
                isSelected={selectedItemIds.includes(item.id)}
                onSelect={(id, e) => {
                  if (e.evt.ctrlKey || e.evt.metaKey) {
                    setSelectedItemIds((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id],
                    );
                  } else {
                    setSelectedItemIds([item.id]);
                    setSelectedShape(null);
                    setSelectedWall(null);
                    setSelectedCeilingItemIds([]);
                    setSelectedWallItemIds([]);
                  }
                }}
                onDragStart={(id) => handleDragStart(id, isShiftPressed)}
                onDragMove={(e) =>
                  handleFurnitureDragMove(item.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onDragEnd={() => handleFurnitureDragEnd(item.id)}
                onChange={(id, newAttrs) => {
                  setFurnitureItems((prev) =>
                    prev.map((f) => (f.id === id ? { ...f, ...newAttrs } : f)),
                  );
                }}
                isShiftPressed={isShiftPressed}
              />
            ))}

            {/* Helper Distance Line  */}
            {helperLines.map((hl, index) => (
              <React.Fragment key={`helper-${index}`}>
                <KonvaLine
                  points={[hl.start.x, hl.start.y, hl.end.x, hl.end.y]}
                  stroke={hl.type === "wall" ? "purple" : "green"}
                  strokeWidth={2}
                  dash={[5, 5]}
                />
                <Text
                  text={`${(hl.distance / PIXELS_PER_METER).toFixed(2)} cm`}
                  x={(hl.start.x + hl.end.x) / 2}
                  y={(hl.start.y + hl.end.y) / 2}
                  fontSize={14}
                  fill={hl.type === "wall" ? "purple" : "green"}
                />
              </React.Fragment>
            ))}
          </Layer>
          <Layer
            opacity={ceilingLayerOpacity}
            listening={ceilingLayerListening}
          >
            {ceilingItems.map((ci) => (
              <FurnitureItemComponent
                key={ci.id}
                item={ci}
                isSelected={selectedCeilingItemIds.includes(ci.id)}
                onSelect={(id, e) => {
                  if (e.evt.ctrlKey || e.evt.metaKey) {
                    setSelectedCeilingItemIds((prev) =>
                      prev.includes(ci.id)
                        ? prev.filter((id) => id !== ci.id)
                        : [...prev, ci.id],
                    );
                  } else {
                    setSelectedCeilingItemIds([ci.id]);
                    setSelectedItemIds([]);
                    setSelectedShape(null);
                    setSelectedWallItemIds([]);
                  }
                }}
                onDragStart={(id) => handleDragStart(id, isShiftPressed)}
                // onChange={(id, newAttrs) => {
                //   const newPos = {
                //     x: newAttrs.x || ci.x,
                //     y: newAttrs.y || ci.y,
                //     rotation: newAttrs.rotation || ci.rotation,
                //   };
                //   handleItemDragEnd(id, newPos, false, false);
                // }}
                onChange={(id, newAttrs) => {
                  setCeilingItems((prev) =>
                    prev.map((f) => (f.id === id ? { ...f, ...newAttrs } : f)),
                  );
                }}
                isShiftPressed={isShiftPressed}
              />
            ))}
          </Layer>
          <Layer opacity={wallLayerOpacity} listening={wallLayerListening}>
            {lines.map((line) => (
              <KonvaLine
                key={`wall-${line.id}`}
                points={line.points}
                stroke="red"
                strokeWidth={line.thickness || 8}
                opacity={1}
              />
            ))}

            {wallItems.map((wi) => (
              <FurnitureItemComponent
                key={wi.id}
                item={wi}
                isSelected={selectedWallItemIds.includes(wi.id)}
                onSelect={(id, e) => {
                  if (e.evt.ctrlKey || e.evt.metaKey) {
                    setSelectedWallItemIds((prev) =>
                      prev.includes(wi.id)
                        ? prev.filter((id) => id !== wi.id)
                        : [...prev, wi.id],
                    );
                  } else {
                    setSelectedWallItemIds([wi.id]);
                    setSelectedItemIds([]);
                    setSelectedShape(null);
                    setSelectedCeilingItemIds([]);
                  }
                }}
                onDragStart={(id) => handleDragStart(id, isShiftPressed)}
                // onChange={(id, newAttrs) => {
                //   const newPos = {
                //     x: newAttrs.x || wi.x,
                //     y: newAttrs.y || wi.y,
                //     rotation: newAttrs.rotation || wi.rotation,
                //   };
                //   handleItemDragEnd(id, newPos, false, true);
                // }}
                onChange={(id, newAttrs) => {
                  setWallItems((prev) =>
                    prev.map((f) => (f.id === id ? { ...f, ...newAttrs } : f)),
                  );
                }}
                isShiftPressed={isShiftPressed}
              />
            ))}

            {shapes.map((shape) => (
              <React.Fragment key={shape.id}>
                <KonvaImage
                  image={shape.image}
                  x={shape.x}
                  y={shape.y}
                  width={shape.type === "door" ? 40 : 70}
                  height={shape.type === "door" ? 40 : 8}
                  rotation={shape.rotation}
                />
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default PlanEditor;
