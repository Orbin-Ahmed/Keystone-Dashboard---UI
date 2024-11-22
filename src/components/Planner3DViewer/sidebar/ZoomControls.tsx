import React from "react";
import CustomButton from "@/components/CustomButton";
import { FaCamera, FaCog, FaFileExport } from "react-icons/fa";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";

interface ZoomControlsProps {
  onSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
  onToggleSettings: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  onSnap,
  onZoomIn,
  onZoomOut,
  onExport,
  onToggleSettings,
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2">
      <CustomButton variant="tertiary" onClick={onSnap}>
        <FaCamera />
      </CustomButton>
      <CustomButton variant="tertiary" onClick={onZoomIn}>
        <BsZoomIn />
      </CustomButton>
      <CustomButton variant="tertiary" onClick={onZoomOut}>
        <BsZoomOut />
      </CustomButton>
      <CustomButton variant="tertiary" onClick={onExport}>
        <FaFileExport />
      </CustomButton>
      <CustomButton variant="tertiary" onClick={onToggleSettings}>
        <FaCog />
      </CustomButton>
    </div>
  );
};

export default ZoomControls;
