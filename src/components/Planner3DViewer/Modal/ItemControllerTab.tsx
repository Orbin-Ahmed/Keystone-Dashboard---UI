import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { SelectionType } from "./ItemCustomizationViewer";

export interface ItemControllerTabProps {
  selectedGroups: SelectionType[];
  onMove: (translation: { x: number; y: number; z: number }) => void;
  onRotate: (rotation: { x: number; y: number; z: number }) => void;
  onRemove: () => void;
}

const ItemControllerTab: React.FC<ItemControllerTabProps> = ({
  selectedGroups,
  onMove,
  onRotate,
  onRemove,
}) => {
  const [move, setMove] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [rotate, setRotate] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });

  const handleMoveChange = (axis: keyof typeof move, value: number) => {
    setMove((prev) => ({ ...prev, [axis]: value }));
  };

  const handleRotateChange = (axis: keyof typeof rotate, value: number) => {
    setRotate((prev) => ({ ...prev, [axis]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">
          Move Selected (&nbsp;{selectedGroups.length}&nbsp;)
        </h3>
        <div className="mt-2 flex gap-4">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="flex flex-col items-center">
              <label className="text-sm uppercase">{axis}</label>
              <input
                type="number"
                value={move[axis]}
                onChange={(e) =>
                  handleMoveChange(axis, parseFloat(e.target.value))
                }
                className="w-16 rounded border p-1 text-center"
              />
            </div>
          ))}
        </div>
        <CustomButton
          onClick={() => onMove(move)}
          variant="secondary"
          className="mt-3"
        >
          Apply Move
        </CustomButton>
      </div>

      <div>
        <h3 className="font-semibold">
          Rotate Selected (&nbsp;{selectedGroups.length}&nbsp;)
        </h3>
        <div className="mt-2 flex gap-4">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="flex flex-col items-center">
              <label className="text-sm uppercase">{axis}</label>
              <input
                type="number"
                value={rotate[axis]}
                onChange={(e) =>
                  handleRotateChange(axis, parseFloat(e.target.value))
                }
                className="w-16 rounded border p-1 text-center"
              />
            </div>
          ))}
        </div>
        <CustomButton
          onClick={() => onRotate(rotate)}
          variant="secondary"
          className="mt-3"
        >
          Apply Rotation
        </CustomButton>
      </div>

      <div>
        <CustomButton onClick={onRemove} variant="secondary">
          Remove Selected (&nbsp;{selectedGroups.length}&nbsp;)
        </CustomButton>
      </div>
    </div>
  );
};

export default ItemControllerTab;
