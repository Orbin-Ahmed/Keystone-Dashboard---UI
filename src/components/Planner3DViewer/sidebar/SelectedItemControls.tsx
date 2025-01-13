import React from "react";
import CustomButton from "@/components/CustomButton";

interface SelectedItemControlsProps {
  onDeselect: () => void;
  onMove: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDelete: () => void;
}

const SelectedItemControls: React.FC<SelectedItemControlsProps> = ({
  onDeselect,
  onMove,
  onRotateLeft,
  onRotateRight,
  onDelete,
}) => {
  return (
    <div className="absolute bottom-20 right-4 flex flex-col gap-2">
      <CustomButton variant="primary" onClick={onDeselect}>
        Deselect Item
      </CustomButton>
      <div className="flex gap-2">
        <CustomButton variant="secondary" onClick={onMove}>
          Move
        </CustomButton>
        {/* <CustomButton variant="secondary" onClick={onRotateLeft}>
          Rotate Left
        </CustomButton>
        <CustomButton variant="secondary" onClick={onRotateRight}>
          Rotate Right
        </CustomButton> */}
        <CustomButton onClick={onDelete}>Delete</CustomButton>
      </div>
    </div>
  );
};

export default SelectedItemControls;
