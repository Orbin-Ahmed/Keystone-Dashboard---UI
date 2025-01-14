// SelectedWallItemControls.tsx
"use client";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { WallItem } from "@/types";

interface SelectedWallItemControlsProps {
  selectedWallItem: WallItem;
  isMovingWallItem: boolean;
  onDeselect: () => void;
  onStartMove: () => void; // user pressed "Move"
  onCancelMove: () => void; // user pressed "Deselect" while moving
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onIncrementZ: () => void;
  onDecrementZ: () => void;
  onPlaceItem: () => void;
  onDelete: () => void;
}

const SelectedWallItemControls: React.FC<SelectedWallItemControlsProps> = ({
  selectedWallItem,
  isMovingWallItem,
  onDeselect,
  onStartMove,
  onCancelMove,
  onRotateLeft,
  onRotateRight,
  onIncrementZ,
  onDecrementZ,
  onPlaceItem,
  onDelete,
}) => {
  if (!selectedWallItem) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md bg-white p-2 shadow-lg">
      {!isMovingWallItem ? (
        <>
          <CustomButton variant="primary" onClick={onDeselect}>
            Deselect
          </CustomButton>
          <CustomButton variant="secondary" onClick={onStartMove}>
            Move
          </CustomButton>
          <CustomButton variant="secondary" onClick={onDelete}>
            Delete
          </CustomButton>
        </>
      ) : (
        <>
          <CustomButton variant="secondary" onClick={onRotateLeft}>
            Rotate Left
          </CustomButton>
          <CustomButton variant="secondary" onClick={onRotateRight}>
            Rotate Right
          </CustomButton>
          <CustomButton variant="secondary" onClick={onIncrementZ}>
            +Z
          </CustomButton>
          <CustomButton variant="secondary" onClick={onDecrementZ}>
            -Z
          </CustomButton>
          <CustomButton variant="primary" onClick={onPlaceItem}>
            Place
          </CustomButton>
          <CustomButton variant="primary" onClick={onCancelMove}>
            Cancel
          </CustomButton>
        </>
      )}
    </div>
  );
};

export default SelectedWallItemControls;
