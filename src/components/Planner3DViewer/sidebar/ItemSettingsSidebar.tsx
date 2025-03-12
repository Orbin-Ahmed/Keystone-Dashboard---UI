import React, { useState, useEffect, ChangeEvent } from "react";
import { PlacedItemType } from "@/types";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface ItemSettingsSidebarProps {
  selectedItem: PlacedItemType;
  onUpdateItem: (updatedItem: PlacedItemType) => void;
  onClose: () => void;
}

const ItemSettingsSidebar: React.FC<ItemSettingsSidebarProps> = ({
  selectedItem,
  onUpdateItem,
  onClose,
}) => {
  const [position, setPosition] = useState<Vector3>({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState<Vector3>({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState<Vector3>({ x: 1, y: 1, z: 1 });
  const [syncScale, setSyncScale] = useState<boolean>(false);
  const [baseDimensions, setBaseDimensions] = useState<{
    width: number;
    height: number;
    depth: number;
  }>({ width: 1, height: 1, depth: 1 });

  useEffect(() => {
    if (selectedItem) {
      setPosition({
        x: selectedItem.position[0],
        y: selectedItem.position[1],
        z: selectedItem.position[2],
      });
      setRotation({
        x: selectedItem.rotation[0],
        y: selectedItem.rotation[1],
        z: selectedItem.rotation[2],
      });
      setScale({ x: 1, y: 1, z: 1 });
      setBaseDimensions({
        width: selectedItem.width,
        height: selectedItem.height,
        depth: selectedItem.depth,
      });
    }
  }, [selectedItem]);

  const updatePosition = (axis: keyof Vector3, value: number) => {
    const newPos = { ...position, [axis]: value };
    setPosition(newPos);
    onUpdateItem({
      ...selectedItem,
      position: [newPos.x, newPos.y, newPos.z],
    });
  };

  const updateScale = (axis: keyof Vector3, value: number) => {
    let newScale: Vector3;
    if (syncScale && axis === "x") {
      newScale = { x: value, y: value, z: value };
    } else {
      newScale = { ...scale, [axis]: value };
    }
    setScale(newScale);
    const newDimensions = {
      width: baseDimensions.width * newScale.x,
      height: baseDimensions.height * newScale.y,
      depth: baseDimensions.depth * newScale.z,
    };
    onUpdateItem({
      ...selectedItem,
      width: newDimensions.width,
      height: newDimensions.height,
      depth: newDimensions.depth,
    });
  };

  const updateRotation = (axis: keyof Vector3, value: number) => {
    const newRot = { ...rotation, [axis]: value };
    setRotation(newRot);
    onUpdateItem({
      ...selectedItem,
      rotation: [newRot.x, newRot.y, newRot.z],
    });
  };

  return (
    <div className="border-gray-200 fixed left-6 top-1/2 z-50 w-72 -translate-y-1/2 transform rounded-lg border bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-gray-800 text-lg font-semibold">Item Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-5">
        <div className="control-section bg-gray-50 rounded-md p-3">
          <h4 className="text-gray-700 mb-2 font-medium">Position</h4>
          <div className="space-y-2">
            {(["x", "y", "z"] as (keyof Vector3)[]).map((axis) => (
              <div key={axis} className="control-group flex items-center">
                <label className="text-gray-600 w-6 font-medium">
                  {axis.toUpperCase()}:
                </label>
                <div className="border-gray-300 ml-2 flex flex-1 items-center rounded-md border bg-white">
                  <button
                    onClick={() => updatePosition(axis, position[axis] - 1)}
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={position[axis]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updatePosition(axis, parseFloat(e.target.value))
                    }
                    className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => updatePosition(axis, position[axis] + 1)}
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-r-md border-l"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="control-section bg-gray-50 rounded-md p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-gray-700 font-medium">Scale</h4>
            <label className="text-gray-600 flex items-center text-sm">
              <input
                type="checkbox"
                checked={syncScale}
                onChange={(e) => setSyncScale(e.target.checked)}
                className="border-gray-300 mr-1 rounded"
              />
              Sync Scale
            </label>
          </div>
          <div className="space-y-2">
            {(["x", "y", "z"] as (keyof Vector3)[]).map((axis) => (
              <div key={axis} className="control-group flex items-center">
                <label className="text-gray-600 w-6 font-medium">
                  {axis.toUpperCase()}:
                </label>
                <div className="border-gray-300 ml-2 flex flex-1 items-center rounded-md border bg-white">
                  <button
                    onClick={() =>
                      updateScale(axis, Math.max(0.1, scale[axis] - 0.1))
                    }
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={scale[axis]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateScale(axis, parseFloat(e.target.value))
                    }
                    className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => updateScale(axis, scale[axis] + 0.1)}
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-r-md border-l"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="control-section bg-gray-50 rounded-md p-3">
          <h4 className="text-gray-700 mb-2 font-medium">Rotation (degrees)</h4>
          <div className="space-y-2">
            {(["x", "y", "z"] as (keyof Vector3)[]).map((axis) => (
              <div key={axis} className="control-group flex items-center">
                <label className="text-gray-600 w-6 font-medium">
                  {axis.toUpperCase()}:
                </label>
                <div className="border-gray-300 ml-2 flex flex-1 items-center rounded-md border bg-white">
                  <button
                    onClick={() => updateRotation(axis, rotation[axis] - 5)}
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={rotation[axis]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateRotation(axis, parseFloat(e.target.value))
                    }
                    className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => updateRotation(axis, rotation[axis] + 5)}
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-r-md border-l"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemSettingsSidebar;
