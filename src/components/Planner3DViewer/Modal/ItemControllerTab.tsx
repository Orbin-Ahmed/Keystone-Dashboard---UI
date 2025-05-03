import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { SelectionType } from "./ItemCustomizationViewer";
import { RiDeleteBinLine } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { TbRotate360 } from "react-icons/tb";
import { FaUndo } from "react-icons/fa";

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
  const [moveHistory, setMoveHistory] = useState<
    { x: number; y: number; z: number }[]
  >([]);
  const [rotateHistory, setRotateHistory] = useState<
    { x: number; y: number; z: number }[]
  >([]);

  const handleMoveChange = (axis: keyof typeof move, value: number) => {
    setMove((prev) => ({ ...prev, [axis]: value }));
  };

  const handleRotateChange = (axis: keyof typeof rotate, value: number) => {
    setRotate((prev) => ({ ...prev, [axis]: value }));
  };

  const applyMove = () => {
    onMove(move);
    setMoveHistory((h) => [...h, move]);
    setMove({ x: 0, y: 0, z: 0 });
  };

  const applyRotate = () => {
    onRotate(rotate);
    setRotateHistory((h) => [...h, rotate]);
    setRotate({ x: 0, y: 0, z: 0 });
  };

  const revertMove = () => {
    if (moveHistory.length === 0) return;
    const last = moveHistory[moveHistory.length - 1];
    const inv = { x: -last.x, y: -last.y, z: -last.z };
    onMove(inv);
    setMoveHistory((h) => h.slice(0, -1));
  };

  const revertRotate = () => {
    if (rotateHistory.length === 0) return;
    const last = rotateHistory[rotateHistory.length - 1];
    const inv = { x: -last.x, y: -last.y, z: -last.z };
    onRotate(inv);
    setRotateHistory((h) => h.slice(0, -1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          Move Selected (&nbsp;{selectedGroups.length}&nbsp;)
          <CustomButton
            onClick={revertMove}
            variant="tertiary"
            disabled={history.length === 0}
            className="px-2 py-1.5"
          >
            <FaUndo />
          </CustomButton>
        </h3>
        <div className="mt-2 flex items-center gap-4">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="flex flex-col items-center">
              <label className="text-sm uppercase">{axis}</label>
              <input
                type="number"
                min={-10}
                max={10}
                value={move[axis]}
                onChange={(e) =>
                  handleMoveChange(axis, parseFloat(e.target.value))
                }
                className="w-16 rounded border p-1 text-center"
              />
            </div>
          ))}

          <CustomButton
            onClick={applyMove}
            variant="secondary"
            className="mt-4"
          >
            <SiTicktick />
          </CustomButton>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          Rotate Selected (&nbsp;{selectedGroups.length}&nbsp;)
          <CustomButton
            onClick={revertRotate}
            variant="tertiary"
            disabled={history.length === 0}
            className="px-2 py-1.5"
          >
            <FaUndo />
          </CustomButton>
        </h3>
        <div className="mt-2 flex items-center gap-4">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="flex flex-col items-center">
              <label className="text-sm uppercase">{axis}</label>
              <input
                type="number"
                min={-360}
                max={360}
                value={rotate[axis]}
                onChange={(e) =>
                  handleRotateChange(axis, parseFloat(e.target.value))
                }
                className="w-16 rounded border p-1 text-center"
              />
            </div>
          ))}
          <CustomButton
            onClick={applyRotate}
            variant="secondary"
            className="mt-4"
          >
            <TbRotate360 />
          </CustomButton>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">
          Delete Selected (&nbsp;{selectedGroups.length}&nbsp;)
        </h3>
        <div>
          <CustomButton onClick={onRemove} variant="secondary" className="mt-4">
            <RiDeleteBinLine />
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ItemControllerTab;
