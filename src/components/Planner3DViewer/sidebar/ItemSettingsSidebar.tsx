import React, { useState, useEffect, ChangeEvent } from "react";
import { PlacedItemType } from "@/types";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface ItemSettingsSidebarProps {
  selectedItem: PlacedItemType;
  onUpdateItem: (updatedItem: PlacedItemType) => void;
  onClose: () => void;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

const ItemSettingsSidebar: React.FC<ItemSettingsSidebarProps> = ({
  selectedItem,
  onUpdateItem,
  onClose,
}) => {
  // ----- POSITION -----
  const [position, setPosition] = useState<Vector3>({ x: 0, y: 0, z: 0 });

  // ----- ROTATION (store in degrees for user) -----
  const [rotationDeg, setRotationDeg] = useState<Vector3>({ x: 0, y: 0, z: 0 });

  // ----- DIMENSIONS -----
  const [dimension, setDimension] = useState<Dimensions>({
    width: 0,
    height: 0,
    depth: 0,
  });
  const [syncDimension, setSyncDimension] = useState<boolean>(false);

  // Initialize all fields when a new item is selected.
  useEffect(() => {
    if (selectedItem) {
      // Position
      setPosition({
        x: selectedItem.position[0],
        y: selectedItem.position[1],
        z: selectedItem.position[2],
      });
      // Rotation: convert radians to degrees for UI
      setRotationDeg({
        x: radToDeg(selectedItem.rotation[0]),
        y: radToDeg(selectedItem.rotation[1]),
        z: radToDeg(selectedItem.rotation[2]),
      });
      // Dimensions
      setDimension({
        width: selectedItem.width,
        height: selectedItem.height,
        depth: selectedItem.depth,
      });
    }
  }, [selectedItem]);

  // ----- POSITION -----
  const updatePosition = (axis: keyof Vector3, value: number) => {
    const newPos = { ...position, [axis]: value };
    setPosition(newPos);
    onUpdateItem({
      ...selectedItem,
      position: [newPos.x, newPos.y, newPos.z],
    });
  };

  // ----- ROTATION -----
  // The user sees degrees (0–360). Convert to radians before updating the item.
  const updateRotationDeg = (axis: keyof Vector3, value: number) => {
    // Clamp between 0 and 360
    const clampedValue = Math.max(0, Math.min(360, value));
    const newRotDeg = { ...rotationDeg, [axis]: clampedValue };
    setRotationDeg(newRotDeg);

    // Convert degrees to radians for the actual item update
    onUpdateItem({
      ...selectedItem,
      rotation: [
        degToRad(newRotDeg.x),
        degToRad(newRotDeg.y),
        degToRad(newRotDeg.z),
      ],
    });
  };

  // ----- DIMENSIONS (SIZE) -----
  const updateDimension = (
    key: keyof Dimensions,
    newValue: number,
    step?: number,
  ) => {
    const finalValue = step ? Math.max(0.1, newValue + step) : newValue;
    const updated = { ...dimension, [key]: finalValue };

    if (syncDimension) {
      const ratio = finalValue / dimension[key];
      if (ratio && isFinite(ratio)) {
        if (key === "width") {
          updated.height = dimension.height * ratio;
          updated.depth = dimension.depth * ratio;
        } else if (key === "height") {
          updated.width = dimension.width * ratio;
          updated.depth = dimension.depth * ratio;
        } else if (key === "depth") {
          updated.width = dimension.width * ratio;
          updated.height = dimension.height * ratio;
        }
      }
    }

    setDimension(updated);
    onUpdateItem({
      ...selectedItem,
      width: updated.width,
      height: updated.height,
      depth: updated.depth,
    });
  };

  return (
    <div className="border-gray-200 fixed left-6 top-1/2 z-50 w-72 -translate-y-1/2 transform rounded-lg border bg-white p-5 shadow-xl">
      {/* Header */}
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
        {/* Position */}
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

        {/* Size (Dimension) */}
        <div className="control-section bg-gray-50 rounded-md p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-gray-700 font-medium">Size</h4>
            <label className="text-gray-600 flex items-center text-sm">
              <input
                type="checkbox"
                checked={syncDimension}
                onChange={(e) => setSyncDimension(e.target.checked)}
                className="border-gray-300 mr-1 rounded"
              />
              Sync
            </label>
          </div>
          <div className="space-y-2">
            {/* Width */}
            <div className="control-group flex items-center">
              <label className="text-gray-600 w-12 font-medium">Width</label>
              <div className="border-gray-300 ml-2 flex flex-1 items-center rounded-md border bg-white">
                <button
                  onClick={() => updateDimension("width", dimension.width, -1)}
                  className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                >
                  -
                </button>
                <input
                  type="number"
                  value={dimension.width.toFixed(1)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDimension("width", parseFloat(e.target.value))
                  }
                  className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                />
                <button
                  onClick={() => updateDimension("width", dimension.width, +1)}
                  className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-r-md border-l"
                >
                  +
                </button>
              </div>
            </div>

            {/* Depth */}
            <div className="control-group flex items-center">
              <label className="text-gray-600 w-12 font-medium">Depth</label>
              <div className="border-gray-300 ml-2 flex flex-1 items-center rounded-md border bg-white">
                <button
                  onClick={() => updateDimension("depth", dimension.depth, -1)}
                  className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                >
                  -
                </button>
                <input
                  type="number"
                  value={dimension.depth.toFixed(1)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDimension("depth", parseFloat(e.target.value))
                  }
                  className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                />
                <button
                  onClick={() => updateDimension("depth", dimension.depth, +1)}
                  className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-r-md border-l"
                >
                  +
                </button>
              </div>
            </div>

            {/* Height */}
            <div className="control-group flex items-center">
              <label className="text-gray-600 w-12 font-medium">Height</label>
              <div className="border-gray-300 ml-2 flex flex-1 items-center rounded-md border bg-white">
                <button
                  onClick={() =>
                    updateDimension("height", dimension.height, -1)
                  }
                  className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                >
                  -
                </button>
                <input
                  type="number"
                  value={dimension.height.toFixed(1)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDimension("height", parseFloat(e.target.value))
                  }
                  className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                />
                <button
                  onClick={() =>
                    updateDimension("height", dimension.height, +1)
                  }
                  className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-r-md border-l"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation (in degrees) */}
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
                    onClick={() =>
                      updateRotationDeg(axis, rotationDeg[axis] - 5)
                    }
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 flex h-8 w-8 items-center justify-center rounded-l-md border-r"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={rotationDeg[axis]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateRotationDeg(axis, parseFloat(e.target.value))
                    }
                    className="h-8 w-full border-0 bg-transparent px-2 text-center focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      updateRotationDeg(axis, rotationDeg[axis] + 5)
                    }
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
