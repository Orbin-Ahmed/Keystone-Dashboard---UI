"use client";
import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import PlanEditorSideBar from "@/components/PlanEditor/PlanEditorSideBar";
import useImage from "use-image";
import { Line, Shape } from "@/types";
import { detectWallPosition } from "@/api";

const PlanEditor = dynamic(() => import("@/components/PlanEditor"), {
  ssr: false,
});

const Planner3DViewer = dynamic(() => import("@/components/Planner3DViewer"), {
  ssr: false,
});

const FloorPlanner = () => {
  const [tool, setTool] = useState<
    "wall" | "window" | "door" | "moveWall" | null
  >(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [selectedWall, setSelectedWall] = useState<number | null>(null);

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [windowImage] = useImage("/textures/window.svg");
  const [doorImage] = useImage("/textures/door.svg");

  const handleDownload = () => {
    const shapesToSave = shapes.map((shape) => ({
      ...shape,
      image: shape.type,
    }));
    const dataStr = JSON.stringify({ lines, shapes: shapesToSave });
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

    const fileType = file.type;

    if (fileType === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          const linesWithThickness = data.lines.map((line: any) => {
            return {
              ...line,
              thickness: line.thickness || 8,
            };
          });

          setLines(linesWithThickness || []);

          const loadedShapes = data.shapes.map((shape: any) => {
            let image = null;
            if (shape.type === "window") {
              image = windowImage;
            } else if (shape.type === "door") {
              image = doorImage;
            }
            return { ...shape, image };
          });

          setShapes(loadedShapes || []);
        } catch (err) {
          console.error("Failed to load design:", err);
        }
      };
      reader.readAsText(file);
    } else if (fileType.startsWith("image/")) {
      try {
        const responseData = await detectWallPosition(file);

        if (responseData) {
          const linesWithThickness = responseData.lines.map((line: any) => {
            return {
              ...line,
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
            return { ...shape, image };
          });

          setShapes(loadedShapes || []);
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
      {viewMode === "3D" ? (
        <Planner3DViewer lines={lines} shapes={shapes} />
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
          windowImage={windowImage}
          doorImage={doorImage}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

export default FloorPlanner;
