import React from "react";
import CustomButton from "../CustomButton";

interface SidebarProps {
  tool: "wall" | "window" | "door" | "moveWall" | null;
  setTool: React.Dispatch<
    React.SetStateAction<"wall" | "window" | "door" | "moveWall" | null>
  >;
  showDimensions: boolean;
  setShowDimensions: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownload: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedShape: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedWall: React.Dispatch<React.SetStateAction<number | null>>;
  viewMode: "2D" | "3D";
  setViewMode: React.Dispatch<React.SetStateAction<"2D" | "3D">>;
}

const PlanEditorSideBar: React.FC<SidebarProps> = ({
  tool,
  setTool,
  showDimensions,
  setShowDimensions,
  handleDownload,
  handleUpload,
  fileInputRef,
  setSelectedShape,
  setSelectedWall,
  viewMode,
  setViewMode,
}) => {
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "3D" ? "2D" : "3D"));
  };

  return (
    <div className="sidebar">
      <CustomButton
        variant={tool === "wall" ? "primary" : "secondary"}
        onClick={() => {
          setTool("wall");
          setSelectedShape(null);
          setSelectedWall(null);
        }}
      >
        Draw Wall
      </CustomButton>
      <CustomButton
        variant={tool === "window" ? "primary" : "secondary"}
        onClick={() => {
          setTool("window");
          setSelectedShape(null);
          setSelectedWall(null);
        }}
      >
        Add Window
      </CustomButton>
      <CustomButton
        variant={tool === "door" ? "primary" : "secondary"}
        onClick={() => {
          setTool("door");
          setSelectedShape(null);
          setSelectedWall(null);
        }}
      >
        Add Door
      </CustomButton>
      <CustomButton
        variant={tool === "moveWall" ? "primary" : "secondary"}
        onClick={() => {
          setTool("moveWall");
          setSelectedShape(null);
          setSelectedWall(null);
        }}
      >
        Move Wall
      </CustomButton>
      <CustomButton
        variant="secondary"
        onClick={() => setShowDimensions(!showDimensions)}
      >
        {showDimensions ? "Hide Dimensions" : "Show Dimensions"}
      </CustomButton>
      {/* 3D Conversion Button */}
      <CustomButton variant="secondary" onClick={toggleViewMode}>
        {viewMode}
      </CustomButton>
      {/* Download and Upload Buttons */}
      <CustomButton variant="secondary" onClick={handleDownload}>
        Download Design
      </CustomButton>
      <CustomButton
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Design
      </CustomButton>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />
    </div>
  );
};

export default PlanEditorSideBar;
