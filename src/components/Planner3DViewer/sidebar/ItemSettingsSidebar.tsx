import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { PlacedItemType, SelectedWallItem } from "@/types";
import { RiCloseLargeLine } from "react-icons/ri";
import CircularSlider from "@fseehawer/react-circular-slider";
import CustomButton from "@/components/CustomButton";

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
  activeItem: PlacedItemType;
  onUpdateItem: (updatedItem: PlacedItemType) => void;
  onClose: () => void;
  placementType: "Wall" | "Ceiling" | "Floor";
  setPlacementType: React.Dispatch<
    React.SetStateAction<"Wall" | "Ceiling" | "Floor">
  >;
  wallHeightSetting: number;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalizeAngle(angle: number): number {
  let result = angle % 360;
  if (result < 0) result += 360;
  return result;
}

const ItemSettingsSidebar: React.FC<ItemSettingsSidebarProps> = ({
  activeItem,
  onUpdateItem,
  onClose,
  placementType,
  setPlacementType,
  wallHeightSetting,
}) => {
  const [position, setPosition] = useState<Vector3>({ x: 0, y: 0, z: 0 });
  const [rotationDeg, setRotationDeg] = useState<Vector3>({ x: 0, y: 0, z: 0 });
  const [dimension, setDimension] = useState<Dimensions>({
    width: 0,
    height: 0,
    depth: 0,
  });
  const [syncDimension, setSyncDimension] = useState<boolean>(false);
  const rotationData = Array.from({ length: 361 }, (_, i) => i.toString());

  const originalPositionRef = useRef<Vector3>({ x: 0, y: 0, z: 0 });
  const originalRotationRef = useRef<Vector3>({ x: 0, y: 0, z: 0 });
  const originalDimensionRef = useRef<Dimensions>({
    width: 0,
    height: 0,
    depth: 0,
  });

  useEffect(() => {
    if (!activeItem) return;
    const pos = {
      x: Math.round(activeItem.position[0] * 100) / 100,
      y: Math.round(activeItem.position[1] * 100) / 100,
      z: Math.round(activeItem.position[2] * 100) / 100,
    };
    const rot = {
      x: normalizeAngle(radToDeg(activeItem.rotation[0])),
      y: normalizeAngle(radToDeg(activeItem.rotation[1])),
      z: normalizeAngle(radToDeg(activeItem.rotation[2])),
    };
    const dim = {
      width: Math.round(activeItem.width * 100) / 100,
      height: Math.round(activeItem.height * 100) / 100,
      depth: Math.round(activeItem.depth * 100) / 100,
    };
    setPosition(pos);
    setRotationDeg(rot);
    setDimension(dim);
    originalPositionRef.current = pos;
    originalRotationRef.current = rot;
    originalDimensionRef.current = dim;
  }, [activeItem?.id]);

  const updatePosition = (axis: keyof Vector3, value: number) => {
    const rounded = Math.round(value * 100) / 100;
    const newPos = { ...position, [axis]: rounded };
    setPosition(newPos);
    onUpdateItem({
      ...activeItem!,
      position: [newPos.x, newPos.y, newPos.z],
    });
  };

  const updateRotationDeg = (axis: keyof Vector3, value: number) => {
    const clampedValue = Math.max(0, Math.min(360, value));
    const rounded = Math.round(clampedValue * 100) / 100;
    const newRot = { ...rotationDeg, [axis]: rounded };
    setRotationDeg(newRot);
    onUpdateItem({
      ...activeItem!,
      rotation: [degToRad(newRot.x), degToRad(newRot.y), degToRad(newRot.z)],
    });
  };

  const updateDimension = (key: keyof Dimensions, newValue: number) => {
    const rounded = Math.round(newValue * 100) / 100;
    const updated = { ...dimension, [key]: rounded };
    if (syncDimension) {
      const ratio = rounded / dimension[key];
      if (ratio && isFinite(ratio)) {
        if (key === "width") {
          updated.height = Math.round(dimension.height * ratio * 100) / 100;
          updated.depth = Math.round(dimension.depth * ratio * 100) / 100;
        } else if (key === "height") {
          updated.width = Math.round(dimension.width * ratio * 100) / 100;
          updated.depth = Math.round(dimension.depth * ratio * 100) / 100;
        } else if (key === "depth") {
          updated.width = Math.round(dimension.width * ratio * 100) / 100;
          updated.height = Math.round(dimension.height * ratio * 100) / 100;
        }
      }
    }
    setDimension(updated);
    onUpdateItem({
      ...activeItem!,
      width: updated.width,
      height: updated.height,
      depth: updated.depth,
    });
  };

  const resetItem = () => {
    setPosition(originalPositionRef.current);
    setRotationDeg(originalRotationRef.current);
    setDimension(originalDimensionRef.current);
    onUpdateItem({
      ...activeItem!,
      position: [
        originalPositionRef.current.x,
        originalPositionRef.current.y,
        originalPositionRef.current.z,
      ],
      rotation: [
        degToRad(originalRotationRef.current.x),
        degToRad(originalRotationRef.current.y),
        degToRad(originalRotationRef.current.z),
      ],
      width: originalDimensionRef.current.width,
      height: originalDimensionRef.current.height,
      depth: originalDimensionRef.current.depth,
    });
  };

  return (
    <div className="fixed left-6 top-1/2 z-50 w-72 -translate-y-1/2 transform rounded-lg border bg-white p-2 text-[12px] shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-gray-800 text-lg font-semibold">Item Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full p-1"
        >
          <RiCloseLargeLine />
        </button>
      </div>

      {/* Dropdown for Placement Type */}
      <div className="control-section bg-gray-50 rounded-md p-2">
        <h4 className="text-gray-700 mb-2 font-medium">Placement Type</h4>
        <select
          value={placementType}
          onChange={(e) => {
            const newType = e.target.value as "Wall" | "Ceiling" | "Floor";
            setPlacementType(newType);
          }}
          className="border-gray-300 w-full rounded-md border p-1"
        >
          <option value="Wall">Wall</option>
          <option value="Ceiling">Ceiling</option>
          <option value="Floor">Floor</option>
        </select>
      </div>

      <div className="space-y-5">
        <div className="control-section bg-gray-50 rounded-md p-2">
          <h4 className="text-gray-700 mb-2 font-medium">Position</h4>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex flex-col">
                <label className="text-gray-600 font-medium">X</label>
                <input
                  type="number"
                  value={position.x}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updatePosition("x", parseFloat(e.target.value))
                  }
                  className="border-gray-300 w-30 rounded-md border p-1 text-center"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 font-medium">Z</label>
                <input
                  type="number"
                  value={position.z}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updatePosition("z", parseFloat(e.target.value))
                  }
                  className="border-gray-300 w-30 rounded-md border p-1 text-center"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 font-medium">Elevation</label>
              <input
                type="range"
                min={0}
                max={wallHeightSetting}
                value={position.y}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updatePosition("y", parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <input
                type="number"
                value={position.y}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updatePosition("y", parseFloat(e.target.value))
                }
                className="border-gray-300 w-16 rounded-md border p-1 text-center"
              />
            </div>
          </div>
        </div>
        <div className="control-section bg-gray-50 rounded-md p-2">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-gray-700 font-medium">Size</h4>
            <label className="text-gray-600 flex items-center">
              <input
                type="checkbox"
                checked={syncDimension}
                onChange={(e) => setSyncDimension(e.target.checked)}
                className="border-gray-300 mr-1 rounded"
              />
              Sync
            </label>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 font-medium">Width</label>
              <input
                type="range"
                min={0.1}
                max={500}
                step={0.01}
                value={dimension.width}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDimension("width", parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <input
                type="number"
                value={dimension.width}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDimension("width", parseFloat(e.target.value))
                }
                className="border-gray-300 w-16 rounded-md border p-1 text-center"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 font-medium">Depth</label>
              <input
                type="range"
                min={0.1}
                max={500}
                step={0.01}
                value={dimension.depth}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDimension("depth", parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <input
                type="number"
                value={dimension.depth}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDimension("depth", parseFloat(e.target.value))
                }
                className="border-gray-300 w-16 rounded-md border p-1 text-center"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 font-medium">Height</label>
              <input
                type="range"
                min={0.1}
                max={500}
                step={0.01}
                value={dimension.height}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDimension("height", parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <input
                type="number"
                value={dimension.height}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDimension("height", parseFloat(e.target.value))
                }
                className="border-gray-300 w-16 rounded-md border p-1 text-center"
              />
            </div>
          </div>
        </div>
        <div className="control-section bg-gray-50 rounded-md p-2">
          <h4 className="text-gray-700 mb-2 font-medium">Rotation (degrees)</h4>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-600 font-medium">X</span>
            <input
              type="number"
              min={0}
              max={360}
              value={rotationDeg.x}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateRotationDeg("x", parseFloat(e.target.value))
              }
              className="border-gray-300 w-16 rounded-md border p-1 text-center"
            />
            <span className="text-gray-600 font-medium">Y</span>
            <input
              type="number"
              min={0}
              max={360}
              value={rotationDeg.y}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateRotationDeg("y", parseFloat(e.target.value))
              }
              className="border-gray-300 w-16 rounded-md border p-1 text-center"
            />
            <span className="text-gray-600 font-medium">Z</span>
            <input
              type="number"
              min={0}
              max={360}
              value={rotationDeg.z}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateRotationDeg("z", parseFloat(e.target.value))
              }
              className="border-gray-300 w-16 rounded-md border p-1 text-center"
            />
          </div>
          {/* Circular Sliders for rotation  */}
          <div className="flex justify-around">
            <div className="w-16">
              <CircularSlider
                width={50}
                min={0}
                max={360}
                trackSize={2}
                knobSize={15}
                valueFontSize="1rem"
                labelColor="#C2D605"
                label=""
                verticalOffset="0px"
                knobColor="#C2D605"
                progressColorFrom="#C2D605"
                progressColorTo="#C2D605"
                progressSize={2}
                trackColor="#eeeeee"
                data={rotationData}
                dataIndex={Math.round(rotationDeg.x)}
                onChange={(value: number) => updateRotationDeg("x", value)}
              />
            </div>
            <div className="w-16">
              <CircularSlider
                width={50}
                min={0}
                max={360}
                trackSize={2}
                knobSize={15}
                label=""
                valueFontSize="1rem"
                labelColor="#C2D605"
                knobColor="#C2D605"
                verticalOffset="0px"
                progressColorFrom="#C2D605"
                progressColorTo="#C2D605"
                progressSize={2}
                trackColor="#eeeeee"
                data={rotationData}
                dataIndex={Math.round(rotationDeg.y)}
                onChange={(value: number) => updateRotationDeg("y", value)}
              />
            </div>
            <div className="w-16">
              <CircularSlider
                width={50}
                min={0}
                max={360}
                trackSize={2}
                knobSize={15}
                label=""
                valueFontSize="1rem"
                labelColor="#C2D605"
                knobColor="#C2D605"
                verticalOffset="0px"
                progressColorFrom="#C2D605"
                progressColorTo="#C2D605"
                progressSize={2}
                trackColor="#eeeeee"
                data={rotationData}
                dataIndex={Math.round(rotationDeg.z)}
                onChange={(value: number) => updateRotationDeg("z", value)}
              />
            </div>
          </div>
          {/* Circular Sliders for rotation end*/}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <CustomButton onClick={resetItem}>Reset</CustomButton>
      </div>
    </div>
  );
};

export default ItemSettingsSidebar;
