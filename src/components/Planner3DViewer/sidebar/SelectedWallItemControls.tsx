// SelectedWallItemControls.tsx
"use client";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { WallItem } from "@/types";

interface SelectedWallItemControlsProps {
  selectedWallItem: WallItem;
  isMovingWallItem: boolean;
  onDeselect: () => void;
  onStartMove: () => void;
  onCancelMove: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onIncrementZ: () => void;
  onDecrementZ: () => void;
  onPlaceItem: () => void;
  onDelete: () => void;
  onCustomize: () => void;
  onHide: () => void;
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
  onCustomize,
  onHide,
}) => {
  if (!selectedWallItem) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md bg-white p-2 shadow-lg">
      {!isMovingWallItem ? (
        <>
          <div className="flex flex-col gap-2">
            <CustomButton variant="primary" onClick={onDeselect}>
              Deselect
            </CustomButton>
            <div className="flex gap-2">
              <CustomButton variant="secondary" onClick={onStartMove}>
                Move
              </CustomButton>
              <CustomButton variant="secondary" onClick={onCustomize}>
                Customize
              </CustomButton>
              <CustomButton variant="secondary" onClick={onHide}>
                Hide
              </CustomButton>
              <CustomButton variant="secondary" onClick={onDelete}>
                Delete
              </CustomButton>
            </div>
          </div>
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
