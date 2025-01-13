"use client";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { WallItem } from "@/types";

interface SelectedWallItemControlsProps {
  selectedWallItem: WallItem;
  onDeselect: () => void;
  onMove: () => void;
  onIncrementZ: () => void;
  onDecrementZ: () => void;
  onPlaceItem: () => void;
  onDelete: () => void;
}

const SelectedWallItemControls: React.FC<SelectedWallItemControlsProps> = ({
  selectedWallItem,
  onDeselect,
  onMove,
  onIncrementZ,
  onDecrementZ,
  onPlaceItem,
  onDelete,
}) => {
  if (!selectedWallItem) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md bg-white p-2 shadow-lg">
      <CustomButton variant="secondary" onClick={onDeselect}>
        Deselect
      </CustomButton>
      <CustomButton variant="secondary" onClick={onMove}>
        Move
      </CustomButton>
      <CustomButton variant="secondary" onClick={onIncrementZ}>
        +Z
      </CustomButton>
      <CustomButton variant="secondary" onClick={onDecrementZ}>
        -Z
      </CustomButton>
      <CustomButton variant="secondary" onClick={onPlaceItem}>
        Place Item
      </CustomButton>
      <CustomButton variant="primary" onClick={onDelete}>
        Delete
      </CustomButton>
    </div>
  );
};

export default SelectedWallItemControls;
