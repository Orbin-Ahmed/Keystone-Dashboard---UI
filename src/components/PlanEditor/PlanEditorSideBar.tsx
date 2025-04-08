import React from "react";
import CustomButton from "@/components/CustomButton";
import {
  FaArrowsAlt,
  FaDownload,
  FaPencilAlt,
  FaRulerCombined,
  FaUpload,
} from "react-icons/fa";
import { TbTransformPoint, TbWindow } from "react-icons/tb";
import { BsDoorOpen } from "react-icons/bs";
import { Tooltip } from "@radix-ui/themes";

interface SidebarProps {
  tool: "wall" | "window" | "door" | "moveWall" | "floorPoint" | null;
  setTool: React.Dispatch<
    React.SetStateAction<
      "wall" | "window" | "door" | "moveWall" | "floorPoint" | null
    >
  >;
  showDimensions: boolean;
  setShowDimensions: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownload: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedShape: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedWall: React.Dispatch<React.SetStateAction<string | null>>;
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
}) => {
  return (
    <div className="z-50 flex h-screen flex-col bg-[#f5f5f5] px-2 py-4 shadow-lg">
      {/* Top Group: Wall, Window, Door, Point */}
      <div className="mt-4 flex flex-col gap-2">
        <Tooltip content="Walls ( I )">
          <span>
            <CustomButton
              className="w-full"
              variant={tool === "wall" ? "primary" : "secondary"}
              onClick={() => {
                setTool("wall");
                setSelectedShape(null);
                setSelectedWall(null);
              }}
            >
              <div className="flex items-center gap-2">
                <FaPencilAlt />
              </div>
            </CustomButton>
          </span>
        </Tooltip>
        <Tooltip content="Window ( W )">
          <span>
            <CustomButton
              className="w-full"
              variant={tool === "window" ? "primary" : "secondary"}
              onClick={() => {
                setTool("window");
                setSelectedShape(null);
                setSelectedWall(null);
              }}
            >
              <div className="flex items-center gap-2">
                <TbWindow />
              </div>
            </CustomButton>
          </span>
        </Tooltip>
        <Tooltip content="Door ( D )">
          <span>
            <CustomButton
              className="w-full"
              variant={tool === "door" ? "primary" : "secondary"}
              onClick={() => {
                setTool("door");
                setSelectedShape(null);
                setSelectedWall(null);
              }}
            >
              <div className="flex items-center gap-2">
                <BsDoorOpen />
              </div>
            </CustomButton>
          </span>
        </Tooltip>
        <Tooltip content="Floor Point ( P )">
          <span>
            <CustomButton
              className="w-full"
              variant={tool === "floorPoint" ? "primary" : "secondary"}
              onClick={() => {
                setTool("floorPoint");
                setSelectedShape(null);
                setSelectedWall(null);
              }}
            >
              <div className="flex items-center gap-2">
                <TbTransformPoint />
              </div>
            </CustomButton>
          </span>
        </Tooltip>
      </div>

      {/* Middle Group: Show/Hide Dimensions and 3D View Mode */}
      <div className="mb-auto mt-auto flex flex-col items-center gap-2">
        <Tooltip content="Move Wall ( M )">
          <span>
            <CustomButton
              className="w-full"
              variant={tool === "moveWall" ? "primary" : "secondary"}
              onClick={() => {
                setTool("moveWall");
                setSelectedShape(null);
                setSelectedWall(null);
              }}
            >
              <div className="flex items-center gap-2">
                <FaArrowsAlt />
              </div>
            </CustomButton>
          </span>
        </Tooltip>
        <Tooltip content="Dimension">
          <span>
            <CustomButton
              className="w-full"
              variant="secondary"
              onClick={() => setShowDimensions(!showDimensions)}
            >
              <div className="flex items-center gap-2">
                <FaRulerCombined />
              </div>
            </CustomButton>
          </span>
        </Tooltip>
      </div>

      {/* Bottom Group: Download and Upload */}
      <div className="mb-4 flex flex-col gap-2">
        <Tooltip content="Download">
          <span>
            <CustomButton variant="secondary" onClick={handleDownload}>
              <FaDownload />
            </CustomButton>
          </span>
        </Tooltip>
        <Tooltip content="Upload">
          <span>
            <CustomButton
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload />
            </CustomButton>
          </span>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </div>
    </div>
  );
};

export default PlanEditorSideBar;
