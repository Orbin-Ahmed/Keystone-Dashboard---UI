import React from "react";
import CustomButton from "@/components/CustomButton";

interface ConfirmPlacementControlsProps {
  onConfirmPlacement: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

const ConfirmPlacementControls: React.FC<ConfirmPlacementControlsProps> = ({
  onConfirmPlacement,
  onRotateLeft,
  onRotateRight,
}) => {
  return (
    <div className="absolute bottom-20 right-4 flex flex-col gap-2">
      <CustomButton variant="primary" onClick={onConfirmPlacement}>
        Place Item
      </CustomButton>
      <div className="flex gap-2">
        <CustomButton variant="secondary" onClick={onRotateLeft}>
          Rotate Left
        </CustomButton>
        <CustomButton variant="secondary" onClick={onRotateRight}>
          Rotate Right
        </CustomButton>
      </div>
    </div>
  );
};

export default ConfirmPlacementControls;
