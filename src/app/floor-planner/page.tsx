"use client";
import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import PlanEditorSideBar from "@/components/PlanEditor/PlanEditorSideBar";
import useImage from "use-image";
import { Line, ShapeType } from "@/types";
import { detectWallPosition } from "@/api";
import { uid } from "uid";
import Konva from "konva";
import CreateBuildingShape from "@/components/Planner3DViewer/CreateBuildingShape";

const PlanEditor = dynamic(() => import("@/components/PlanEditor"), {
  ssr: false,
});

const Planner3DViewer = dynamic(() => import("@/components/Planner3DViewer"), {
  ssr: false,
});

const MAX_DISTANCE = 10;
const EXTENSION_LENGTH = 5;
let roomIdCounter = 0;

const FloorPlanner = () => {
  const [tool, setTool] = useState<
    "wall" | "window" | "door" | "moveWall" | "floorPoint" | null
  >(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");

  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [floorPlanPoints, setFloorPlanPoints] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const [roomNames, setRoomNames] = useState<
    { id: number; x: number; y: number; name: string; offsetX: number }[]
  >([]);

  const [shapes, setShapes] = useState<ShapeType[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [windowImage] = useImage("/textures/window.svg");
  const [doorImage] = useImage("/textures/door.svg");

  const distance = (point1: any, point2: any) =>
    Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2),
    );

  const measureTextWidth = (
    text: string,
    fontSize = 18,
    fontStyle = "bold",
  ): number => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `${fontStyle} ${fontSize}px sans-serif`;
      const metrics = context.measureText(text);
      return metrics.width;
    } else {
      console.error("Unable to get 2D context from canvas.");
      return 0;
    }
  };

  const handleDownload = () => {
    const shapesToSave = shapes.map((shape) => ({
      ...shape,
      image: shape.type,
    }));

    const roomNamesToSave = roomNames.map((room) => ({
      x: room.x,
      y: room.y,
      name: room.name,
    }));

    const dataStr = JSON.stringify({
      lines,
      shapes: shapesToSave,
      roomNames: roomNamesToSave,
    });

    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "design.json";

    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const connectCloseLinesByExtending = (lines: any[]) => {
    const updatedLines = lines.map((line) => ({
      ...line,
      points: [...line.points],
    }));

    const isHorizontal = (line: any) =>
      Math.abs(line.points[1] - line.points[3]) < 1;
    const isVertical = (line: any) =>
      Math.abs(line.points[0] - line.points[2]) < 1;

    for (let i = 0; i < updatedLines.length; i++) {
      for (let j = i + 1; j < updatedLines.length; j++) {
        const lineA = updatedLines[i];
        const lineB = updatedLines[j];

        const pointsA = lineA.points;
        const pointsB = lineB.points;
        const A_start = { x: pointsA[0], y: pointsA[1] };
        const A_end = { x: pointsA[2], y: pointsA[3] };
        const B_start = { x: pointsB[0], y: pointsB[1] };
        const B_end = { x: pointsB[2], y: pointsB[3] };

        const endpointPairs = [
          {
            pointAName: "A_end",
            pointBName: "B_start",
            pointA: A_end,
            pointB: B_start,
          },
          {
            pointAName: "A_end",
            pointBName: "B_end",
            pointA: A_end,
            pointB: B_end,
          },
          {
            pointAName: "A_start",
            pointBName: "B_start",
            pointA: A_start,
            pointB: B_start,
          },
          {
            pointAName: "A_start",
            pointBName: "B_end",
            pointA: A_start,
            pointB: B_end,
          },
        ];

        endpointPairs.forEach(({ pointAName, pointBName, pointA, pointB }) => {
          const dist = distance(pointA, pointB);

          if (dist <= MAX_DISTANCE) {
            if (isHorizontal(lineA) && isHorizontal(lineB)) {
              if (pointAName === "A_start") {
                lineA.points[0] = pointB.x;
                lineA.points[2] += EXTENSION_LENGTH;
              } else {
                lineA.points[2] = pointB.x;
                lineA.points[2] += EXTENSION_LENGTH;
              }
            } else if (isVertical(lineA) && isVertical(lineB)) {
              if (pointAName === "A_start") {
                lineA.points[1] = pointB.y;
                lineA.points[3] += EXTENSION_LENGTH;
              } else {
                lineA.points[3] = pointB.y;
                lineA.points[3] += EXTENSION_LENGTH;
              }
            }
          }
        });
      }
    }

    return updatedLines;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const fileType = file.type;

    if (fileType === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          const connectedLines = connectCloseLinesByExtending(data.lines);

          const linesWithThickness = connectedLines.map((line: Line) => {
            return {
              ...line,
              id: line.id || uid(),
              thickness: line.thickness || 8,
            };
          });

          setLines(linesWithThickness || []);

          const loadedShapes = data.shapes.map((shape: ShapeType) => {
            let image = null;
            if (shape.type === "window") {
              image = windowImage;
            } else if (shape.type === "door") {
              image = doorImage;
            }
            return { ...shape, id: shape.id || uid(), image };
          });

          setShapes(loadedShapes || []);

          const loadedRoomNames = (data.roomNames || []).map(
            (room: { x: number; y: number; name: string }) => {
              const textWidth = measureTextWidth(room.name);
              return {
                ...room,
                id: roomIdCounter++,
                offsetX: textWidth / 2,
              };
            },
          );
          setRoomNames(loadedRoomNames);
        } catch (err) {
          console.error("Failed to load design:", err);
        }
      };
      reader.readAsText(file);
    } else if (fileType.startsWith("image/")) {
      try {
        const responseData = await detectWallPosition(file);

        if (responseData) {
          const connectedLines = connectCloseLinesByExtending(
            responseData.lines,
          );

          const linesWithThickness = connectedLines.map((line: any) => {
            return {
              ...line,
              id: line.id || uid(),
              thickness: line.thickness || 8,
            };
          });

          setLines(linesWithThickness || []);

          const loadedShapes = responseData.shapes.map((shape: any) => {
            let image = null;
            if (shape.type === "window") {
              image = windowImage;
            } else if (shape.type === "door") {
              image = doorImage;
            }
            return { ...shape, id: shape.id || uid(), image };
          });

          setShapes(loadedShapes || []);

          const loadedRoomNames = (responseData.roomNames || []).map(
            (room: { x: number; y: number; name: string }) => {
              const textWidth = measureTextWidth(room.name);
              return {
                ...room,
                id: roomIdCounter++,
                offsetX: textWidth / 2,
              };
            },
          );
          setRoomNames(loadedRoomNames);
        } else {
          console.error("No data returned from API");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    } else {
      console.error(
        "Unsupported file format. Please upload a JSON or an image.",
      );
    }
  };

  const addRoomName = (x: number, y: number, name: string) => {
    const textWidth = measureTextWidth(name);
    setRoomNames((prevRoomNames) => [
      ...prevRoomNames,
      {
        id: roomIdCounter++,
        x,
        y,
        name,
        offsetX: textWidth / 2,
      },
    ]);
  };

  const editRoomName = (id: number, newName: string) => {
    const textWidth = measureTextWidth(newName);
    setRoomNames((prevRoomNames) =>
      prevRoomNames.map((room) =>
        room.id === id
          ? { ...room, name: newName, offsetX: textWidth / 2 }
          : room,
      ),
    );
  };

  const deleteRoomName = (id: number) => {
    setRoomNames((prevRoomNames) =>
      prevRoomNames.filter((room) => room.id !== id),
    );
  };

  const calculateBounds = (lines: Line[]) => {
    if (lines.length === 0) {
      return {
        centerX: 0,
        centerY: 0,
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
      };
    }

    const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
    const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    return {
      minX,
      maxX,
      minY,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  };

  const { centerX, centerY, minX, maxX, minY, maxY } = calculateBounds(lines);

  useEffect(() => {
    const result = CreateBuildingShape(lines, centerX, centerY);

    if (result.floorPlanPoints.length > 0) {
      const formattedFloorPlanPoints = result.floorPlanPoints.map((point) => ({
        x: point.x + centerX,
        y: point.y + centerY,
        id: uid(),
      }));
      setFloorPlanPoints(formattedFloorPlanPoints);
    } else {
      setFloorPlanPoints([]);
    }
  }, [lines, centerX, centerY]);

  if (!windowImage || !doorImage) {
    return <div>Loading...</div>;
  }
  return (
    <div className="editor-container">
      <PlanEditorSideBar
        tool={tool}
        setTool={setTool}
        showDimensions={showDimensions}
        setShowDimensions={setShowDimensions}
        handleDownload={handleDownload}
        handleUpload={handleUpload}
        fileInputRef={fileInputRef}
        setSelectedShape={setSelectedShape}
        setSelectedWall={setSelectedWall}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      {viewMode === "2D" ? (
        <Planner3DViewer
          lines={lines}
          shapes={shapes}
          roomNames={roomNames}
          floorPlanPoints={floorPlanPoints}
          centerX={centerX}
          centerY={centerY}
          minX={minX}
          maxX={maxX}
          minY={minY}
          maxY={maxY}
        />
      ) : (
        <PlanEditor
          tool={tool}
          setTool={setTool}
          showDimensions={showDimensions}
          setShowDimensions={setShowDimensions}
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          selectedWall={selectedWall}
          setSelectedWall={setSelectedWall}
          shapes={shapes}
          setShapes={setShapes}
          lines={lines}
          setLines={setLines}
          floorPlanPoints={floorPlanPoints}
          setFloorPlanPoints={setFloorPlanPoints}
          windowImage={windowImage}
          doorImage={doorImage}
          viewMode={viewMode}
          roomNames={roomNames}
          setRoomNames={setRoomNames}
          addRoomName={addRoomName}
          editRoomName={editRoomName}
          deleteRoomName={deleteRoomName}
        />
      )}
    </div>
  );
};

export default FloorPlanner;
