"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import PlanEditorSideBar from "@/components/PlanEditor/PlanEditorSideBar";
import useImage from "use-image";
import {
  FloorData,
  FloorPlanPoint,
  FurnitureItem,
  Line,
  RoomName,
  SerializedFloorData,
  SerializedFurnitureItem,
  SerializedRoomName,
  SerializedShape,
  ShapeType,
} from "@/types";
import { detectWallPosition } from "@/api";
import { uid } from "uid";
import CreateBuildingShape from "@/components/PlanEditor/CreateBuildingShape";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import ItemSidebar from "@/components/PlanEditor/Sidebar/ItemSidebar";

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
  // sidebar states
  const [tool, setTool] = useState<
    "wall" | "window" | "door" | "moveWall" | "floorPoint" | null
  >(null);
  const [showDimensions, setShowDimensions] = useState(false);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  // Single Floor Data
  const [lines, setLines] = useState<Line[]>([]);
  const [shapes, setShapes] = useState<ShapeType[]>([]);
  const [roomNames, setRoomNames] = useState<RoomName[]>([]);
  const [floorPlanPoints, setFloorPlanPoints] = useState<FloorPlanPoint[]>([]);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);

  // Multi Floor Data
  const floorNames = Array.from({ length: 10 }, (_, i) => `Floor ${i}`);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [currentFloor, setCurrentFloor] = useState<string>(floorNames[0]);
  const [floors, setFloors] = useState<Record<string, FloorData>>({
    [floorNames[0]]: {
      lines: [],
      shapes: [],
      roomNames: [],
      floorPlanPoints: [],
      furnitureItems: [],
    },
  });

  // Misc states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [windowImage] = useImage("/textures/window.svg");
  const [doorImage] = useImage("/textures/door.svg");

  // Upload download function
  const handleDownload = () => {
    const floorsToSave = Object.entries(floors).reduce(
      (acc, [floorName, floorData]) => {
        const shapesToSave: SerializedShape[] = floorData.shapes.map(
          (shape) => ({
            ...shape,
            image: shape.type,
          }),
        );

        const roomNamesToSave: SerializedRoomName[] = floorData.roomNames.map(
          (room) => ({
            x: room.x,
            y: room.y,
            name: room.name,
          }),
        );

        const floorPlanPointsToSave = floorData.floorPlanPoints.map(
          (point) => ({
            id: point.id,
            x: point.x,
            y: point.y,
          }),
        );

        const furnitureItemsToSave = furnitureItems.map((item) => ({
          id: item.id,
          x: item.x,
          y: item.y,
          name: item.name,
          width: item.width,
          height: item.height,
          depth: item.depth,
          rotation: item.rotation,
          category: item.category,
        }));

        acc[floorName] = {
          lines: floorData.lines,
          shapes: shapesToSave,
          roomNames: roomNamesToSave,
          floorPlanPoints: floorPlanPointsToSave,
          furniture: furnitureItemsToSave,
        };

        return acc;
      },
      {} as Record<string, SerializedFloorData>,
    );

    const dataStr = JSON.stringify(floorsToSave);

    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "design.json";

    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
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
          let parsedFloors: Record<string, FloorData> = {};

          if (data.lines && data.shapes && data.roomNames) {
            parsedFloors["Floor 0"] = processFloorData(data);
          } else {
            for (const floorName in data) {
              if (data.hasOwnProperty(floorName)) {
                parsedFloors[floorName] = processFloorData(data[floorName]);
              }
            }
          }

          setFloors(parsedFloors);
          const floorNameList = Object.keys(parsedFloors);
          const firstFloorName = floorNameList[0];

          setCurrentFloor(firstFloorName);
          setCurrentFloorIndex(floorNames.indexOf(firstFloorName));

          const firstFloorData = parsedFloors[firstFloorName];

          setLines(firstFloorData.lines);
          setShapes(firstFloorData.shapes);
          setRoomNames(firstFloorData.roomNames);
          setFloorPlanPoints(firstFloorData.floorPlanPoints);
          setFurnitureItems(firstFloorData.furnitureItems ?? []);
        } catch (err) {
          console.error("Failed to load design:", err);
        }
      };
      reader.readAsText(file);
    } else if (fileType.startsWith("image/")) {
      try {
        const responseData = await detectWallPosition(file);
        let parsedFloors: Record<string, FloorData> = {};

        if (
          responseData.lines &&
          responseData.shapes &&
          responseData.roomNames
        ) {
          parsedFloors["Floor 0"] = processFloorData(responseData);
        } else {
          for (const floorName in responseData) {
            if (responseData.hasOwnProperty(floorName)) {
              parsedFloors[floorName] = processFloorData(
                responseData[floorName],
              );
            }
          }
        }

        setFloors(parsedFloors);
        const floorNameList = Object.keys(parsedFloors);
        const firstFloorName = floorNameList[0];
        setCurrentFloor(firstFloorName);
        setCurrentFloorIndex(floorNames.indexOf(firstFloorName));
        const firstFloorData = parsedFloors[firstFloorName];
        setLines(firstFloorData.lines);
        setShapes(firstFloorData.shapes);
        setRoomNames(firstFloorData.roomNames);
        setFloorPlanPoints(firstFloorData.floorPlanPoints);
        setFurnitureItems(firstFloorData.furnitureItems ?? []);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    } else if (fileType === "application/pdf") {
      try {
        const responseData = await detectWallPosition(file);
        let parsedFloors: Record<string, FloorData> = {};

        for (const floorName in responseData) {
          if (responseData.hasOwnProperty(floorName)) {
            parsedFloors[floorName] = processFloorData(responseData[floorName]);
          }
        }

        setFloors(parsedFloors);
        const floorNameList = Object.keys(parsedFloors);
        const firstFloorName = floorNameList[0];
        setCurrentFloor(firstFloorName);
        setCurrentFloorIndex(floorNames.indexOf(firstFloorName));

        const firstFloorData = parsedFloors[firstFloorName];

        setLines(firstFloorData.lines);
        setShapes(firstFloorData.shapes);
        setRoomNames(firstFloorData.roomNames);
        setFloorPlanPoints(firstFloorData.floorPlanPoints);
        setFurnitureItems(firstFloorData.furnitureItems ?? []);
      } catch (error) {
        console.error("Error processing PDF:", error);
      }
    } else {
      console.error(
        "Unsupported file format. Please upload a JSON or an image.",
      );
    }
  };

  // Upload download function

  // Room helper Function
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
  // Room helper Function end

  const { centerX, centerY, minX, maxX, minY, maxY } = useMemo(() => {
    const allX = lines.flatMap((line) => [line.points[0], line.points[2]]);
    const allY = lines.flatMap((line) => [line.points[1], line.points[3]]);
    return {
      minX: Math.min(...allX),
      maxX: Math.max(...allX),
      minY: Math.min(...allY),
      maxY: Math.max(...allY),
      centerX: (Math.min(...allX) + Math.max(...allX)) / 2,
      centerY: (Math.min(...allY) + Math.max(...allY)) / 2,
    };
  }, [lines]);

  // Floor Data helper Function
  const handleNextFloor = () => {
    const nextIndex = (currentFloorIndex + 1) % floorNames.length;
    const nextFloorName = floorNames[nextIndex];
    handleFloorSwitch(nextFloorName, nextIndex);
  };

  const handlePreviousFloor = () => {
    const prevIndex =
      (currentFloorIndex - 1 + floorNames.length) % floorNames.length;
    const prevFloorName = floorNames[prevIndex];
    handleFloorSwitch(prevFloorName, prevIndex);
  };

  const handleFloorSwitch = (floorName: string, floorIndex: number) => {
    const updatedFloors = {
      ...floors,
      [currentFloor]: {
        lines,
        shapes,
        roomNames,
        floorPlanPoints,
        furnitureItems,
      },
    };

    const newFloorData = updatedFloors[floorName] || {
      lines: [],
      shapes: [],
      roomNames: [],
      floorPlanPoints: [],
      furnitureItems: [],
    };

    setFloors(updatedFloors);
    setCurrentFloor(floorName);
    setCurrentFloorIndex(floorIndex);
    setLines(newFloorData.lines);
    setShapes(newFloorData.shapes);
    setRoomNames(newFloorData.roomNames);
    setFloorPlanPoints(newFloorData.floorPlanPoints);
    setFurnitureItems(newFloorData.furnitureItems ?? []);
  };

  useEffect(() => {
    setFloors((prevFloors) => ({
      ...prevFloors,
      [currentFloor]: {
        lines,
        shapes,
        roomNames,
        floorPlanPoints,
        furnitureItems,
      },
    }));
  }, [lines, shapes, roomNames, floorPlanPoints, currentFloor, furnitureItems]);

  // Floor Data helper Function end

  if (!windowImage || !doorImage) {
    return <div>Loading...</div>;
  }

  // Helper function
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

  const connectCloseLinesByExtending = (lines: Line[]) => {
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

  const processFloorData = (floorData: SerializedFloorData): FloorData => {
    // Process lines
    let processedLines: Line[] = [];
    if (floorData.lines && floorData.lines.length > 0) {
      processedLines = connectCloseLinesByExtending(
        floorData.lines.map((line: Line) => {
          return {
            ...line,
            id: line.id || uid(),
            thickness: line.thickness || 8,
          };
        }),
      );
    }

    // Process shapes
    let processedShapes: ShapeType[] = [];
    if (floorData.shapes && floorData.shapes.length > 0) {
      processedShapes = floorData.shapes.map((shape: SerializedShape) => {
        let image: HTMLImageElement | null = null;
        if (shape.image === "window") {
          image = windowImage;
        } else if (shape.image === "door") {
          image = doorImage;
        }
        return {
          ...shape,
          image: image!,
        };
      });
    }

    // Process room names
    let processedRoomNames: RoomName[] = [];
    if (floorData.roomNames && floorData.roomNames.length > 0) {
      processedRoomNames = floorData.roomNames.map(
        (room: SerializedRoomName) => {
          const textWidth = measureTextWidth(room.name);
          return {
            ...room,
            id: roomIdCounter++,
            offsetX: textWidth / 2,
          };
        },
      );
    }

    // Process furniture names
    let processedFurnitureNames: FurnitureItem[] = [];
    if (floorData.furniture && floorData.furniture.length > 0) {
      processedFurnitureNames = floorData.furniture.map(
        (item: SerializedFurnitureItem) => ({
          ...item,
          imageSrc: `/2DViewerAssets/${item.name.toLowerCase().replace(/-/g, "_")}.svg`,
        }),
      );
    }

    // Process floor plan points
    let processedFloorPlanPoints: FloorPlanPoint[] = [];
    if (floorData.floorPlanPoints && floorData.floorPlanPoints.length > 0) {
      processedFloorPlanPoints = floorData.floorPlanPoints.map((point) => ({
        ...point,
        id: point.id || uid(),
      }));
    } else {
      const allPoints = processedLines.flatMap((line) => [
        { x: line.points[0], y: line.points[1] },
        { x: line.points[2], y: line.points[3] },
      ]);

      const calculatedCenterX =
        allPoints.reduce((sum, point) => sum + point.x, 0) /
        (allPoints.length || 1);
      const calculatedCenterY =
        allPoints.reduce((sum, point) => sum + point.y, 0) /
        (allPoints.length || 1);
      const result = CreateBuildingShape(
        processedLines,
        calculatedCenterX,
        calculatedCenterY,
      );

      if (result.floorPlanPoints.length > 0) {
        const newPoints = result.floorPlanPoints.map((point) => ({
          x: point.x + calculatedCenterX,
          y: point.y + calculatedCenterY,
          id: uid(),
        }));

        processedFloorPlanPoints = newPoints;
      }
    }

    return {
      lines: processedLines,
      shapes: processedShapes,
      roomNames: processedRoomNames,
      floorPlanPoints: processedFloorPlanPoints,
      furnitureItems: processedFurnitureNames,
    };
  };

  // Helper function

  // const mergeFloorPlanPoints = (
  //   existingPoints: FloorPlanPoint[],
  //   newPoints: { x: number; y: number }[],
  // ): FloorPlanPoint[] => {
  //   const tolerance = 10;

  //   const mergedPoints = [...existingPoints];

  //   newPoints.forEach((newPoint) => {
  //     const exists = existingPoints.some((existingPoint) => {
  //       const dx = existingPoint.x - newPoint.x;
  //       const dy = existingPoint.y - newPoint.y;
  //       return dx * dx + dy * dy <= tolerance * tolerance;
  //     });

  //     if (!exists) {
  //       mergedPoints.push({
  //         ...newPoint,
  //         id: uid(),
  //       });
  //     }
  //   });

  //   return mergedPoints;
  // };

  // useEffect(() => {
  //   const result = CreateBuildingShape(lines, centerX, centerY);

  //   if (result.floorPlanPoints.length > 0) {
  //     const newPoints = result.floorPlanPoints.map((point) => ({
  //       x: point.x + centerX,
  //       y: point.y + centerY,
  //       id: uid(),
  //     }));

  //     setFloorPlanPoints((prevFloorPlanPoints) => {
  //       const mergedPoints = mergeFloorPlanPoints(
  //         prevFloorPlanPoints,
  //         newPoints,
  //       );
  //       return mergedPoints;
  //     });
  //   }
  // }, [lines, centerX, centerY]);

  // useEffect(() => {
  //   console.log(floorPlanPoints);
  // }, [floorPlanPoints]);

  return (
    <div className="editor-container">
      {viewMode === "2D" && (
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
        />
      )}
      {viewMode === "3D" ? (
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
          furnitureItems={furnitureItems}
          setFurnitureItems={setFurnitureItems}
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
          furnitureItems={furnitureItems}
          setFurnitureItems={setFurnitureItems}
        />
      )}
      {viewMode === "2D" && <ItemSidebar />}
      <div
        className={`fixed bottom-8 ${viewMode === "2D" ? "left-32" : "left-8"} z-30`}
      >
        <label
          htmlFor="viewModeToggle"
          className="relative inline-flex cursor-pointer select-none items-center"
        >
          <input
            type="checkbox"
            id="viewModeToggle"
            name="viewModeToggle"
            className="sr-only"
            checked={viewMode === "2D"}
            onChange={() =>
              setViewMode((prev) => (prev === "2D" ? "3D" : "2D"))
            }
          />
          <div className="flex h-[46px] w-[82px] items-center justify-between rounded-md border border-stroke bg-white">
            <span
              className={`${
                viewMode === "2D" ? "bg-primary text-white" : "text-body-color"
              } flex h-full w-1/2 items-center justify-center rounded-md`}
            >
              2D
            </span>
            <span
              className={`${
                viewMode === "3D" ? "bg-primary text-white" : "text-body-color"
              } flex h-full w-1/2 items-center justify-center rounded-md`}
            >
              3D
            </span>
          </div>
        </label>
      </div>

      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-4">
        <button
          className="rounded-full p-4 shadow-xl"
          onClick={handlePreviousFloor}
        >
          <GrLinkPrevious />
        </button>
        <p>{currentFloor}</p>
        <button
          className="rounded-full p-4 shadow-xl"
          onClick={handleNextFloor}
        >
          <GrLinkNext />
        </button>
      </div>
    </div>
  );
};

export default FloorPlanner;
