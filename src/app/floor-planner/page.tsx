'use client'
import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import PlanEditorSideBar from "@/components/PlanEditor/PlanEditorSideBar";
import useImage from "use-image";
import { Line, Shape } from "@/types";

const PlanEditor = dynamic(() => import("@/components/PlanEditor"), {
  ssr: false,
});



const FloorPlanner = () => {
  const [tool, setTool] = useState<"wall" | "window" | "door" | "moveWall" | null>(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
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
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "design.json";

    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setLines(data.lines || []);
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
    </div>
  );
};

export default FloorPlanner;
