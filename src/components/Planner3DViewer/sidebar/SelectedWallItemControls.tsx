import React from "react";
import CustomButton from "@/components/CustomButton";

interface SelectedWallItemControlsProps {
  onDeselect: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onIncrementZ: () => void;
  onDecrementZ: () => void;
}

const SelectedWallItemControls: React.FC<SelectedWallItemControlsProps> = ({
  onDeselect,
  onRotateLeft,
  onRotateRight,
  onIncrementZ,
  onDecrementZ,
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
      <CustomButton variant="secondary" onClick={onRotateLeft}>
        Rotate Left
      </CustomButton>
      <CustomButton variant="secondary" onClick={onRotateRight}>
        Rotate Right
      </CustomButton>
      <CustomButton variant="secondary" onClick={onIncrementZ}>
        Move Z+
      </CustomButton>
      <CustomButton variant="secondary" onClick={onDecrementZ}>
        Move Z-
      </CustomButton>
      <CustomButton variant="primary" onClick={onDeselect}>
        Deselect
      </CustomButton>
    </div>
  );
};

export default SelectedWallItemControls;
