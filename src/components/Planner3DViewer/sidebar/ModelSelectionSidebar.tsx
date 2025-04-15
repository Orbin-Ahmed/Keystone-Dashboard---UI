import React from "react";
import { ShapeData } from "@/types";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";

interface ModelSelectionSidebarProps {
  selectedShape: ShapeData;
  flipShape: boolean;
  setFlipShape: (value: boolean) => void;
  newWidth: number | "";
  setNewWidth: (value: number | "") => void;
  newHeight: number | "";
  setNewHeight: (value: number | "") => void;
  newX: number | "";
  setNewX: (value: number | "") => void;
  newY: number | "";
  setNewY: (value: number | "") => void;
  selectedModelPath: string | null;
  setSelectedModelPath: (value: string | null) => void;
  doorOptions: { label: string; value: string }[];
  windowOptions: { label: string; value: string }[];
  onSaveChanges: () => void;
  onClose: () => void;
}

const ModelSelectionSidebar: React.FC<ModelSelectionSidebarProps> = ({
  selectedShape,
  flipShape,
  setFlipShape,
  newWidth,
  setNewWidth,
  newHeight,
  setNewHeight,
  newX,
  newY,
  setNewX,
  setNewY,
  selectedModelPath,
  setSelectedModelPath,
  doorOptions,
  windowOptions,
  onSaveChanges,
  onClose,
}) => {
  return (
    <div className="border-gray-200 fixed right-4 top-4 z-50 w-64 rounded-lg border bg-white p-4 shadow-lg">
      <h3 className="text-gray-800 mb-4 text-lg font-semibold">
        {selectedShape.type.toUpperCase()} Model (Inch)
      </h3>
      {/* Flip Checkbox */}
      <div className="my-3 flex items-center">
        <input
          type="checkbox"
          id="flip_checkbox"
          checked={flipShape}
          onChange={(e) => setFlipShape(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="flip_checkbox">Flip</label>
      </div>
      {/* Dimension Inputs */}
      <div className="my-3">
        <InputField
          className="my-2 px-3.5 py-2"
          name="width"
          id="width_id"
          type="number"
          placeholder="Width"
          value={newWidth}
          onChange={(e) => setNewWidth(Number(e.target.value))}
        />
        <InputField
          className="my-2 px-3.5 py-2"
          name="height"
          id="height_id"
          type="number"
          placeholder="Height"
          value={newHeight}
          onChange={(e) => setNewHeight(Number(e.target.value))}
        />
      </div>
      {/* Position Inputs */}
      <div className="my-3">
        <InputField
          className="my-2 px-3.5 py-2"
          name="position_x"
          id="position_x_id"
          type="number"
          placeholder="Position X"
          value={newX}
          onChange={(e) => setNewX(Number(e.target.value))}
        />
        <InputField
          className="my-2 px-3.5 py-2"
          name="position_y"
          id="position_y_id"
          type="number"
          placeholder="Position Y"
          value={newY}
          onChange={(e) => setNewY(Number(e.target.value))}
        />
      </div>
      {/* Model Selection Dropdown */}
      <div className="my-3">
        <label htmlFor="model_select" className="mb-1 block">
          Select Model
        </label>
        <select
          id="model_select"
          value={selectedModelPath || ""}
          onChange={(e) => setSelectedModelPath(e.target.value)}
          className="w-full rounded border p-2"
        >
          <option value="">Select a model</option>
          {(selectedShape.type === "door" ? doorOptions : windowOptions).map(
            (option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ),
          )}
        </select>
      </div>
      {/* Save Changes Button */}
      <CustomButton
        onClick={onSaveChanges}
        variant="primary"
        className="m-auto w-full"
      >
        Save Changes
      </CustomButton>
      <CustomButton
        onClick={onClose}
        variant="secondary"
        className="m-auto mt-2 w-full"
      >
        Close
      </CustomButton>
    </div>
  );
};

export default ModelSelectionSidebar;
