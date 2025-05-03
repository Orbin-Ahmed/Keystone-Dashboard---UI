import React, { useState, useEffect } from "react";
import { SegmentedControl } from "@radix-ui/themes";

export type LightCategory = "spot" | "wall" | "hidden";
export type PresetName = "Low" | "Mid" | "High" | "Custom";
export type LightPresetValue =
  | `${LightCategory}-${Exclude<PresetName, "Custom">}`
  | "custom";

export interface PresetConfig {
  color: string;
  strength: number;
}

const LIGHT_PRESETS: Record<
  LightCategory,
  Record<Exclude<PresetName, "Custom">, PresetConfig>
> = {
  spot: {
    Low: { color: "#FFD280", strength: 200 },
    Mid: { color: "#FFC14D", strength: 800 },
    High: { color: "#FFAA00", strength: 2000 },
  },
  wall: {
    Low: { color: "#80FFD2", strength: 150 },
    Mid: { color: "#4DFFC1", strength: 600 },
    High: { color: "#00FFA7", strength: 1500 },
  },
  hidden: {
    Low: { color: "#B280FF", strength: 100 },
    Mid: { color: "#9F4DFF", strength: 400 },
    High: { color: "#7A00FF", strength: 1000 },
  },
};

interface LightPresetSelectorProps {
  manualColor: string;
  manualStrength: number;
  onChange: (color: string, strength: number) => void;
}

const LightPresetSelector: React.FC<LightPresetSelectorProps> = ({
  manualColor,
  manualStrength,
  onChange,
}) => {
  const [preset, setPreset] = useState<LightPresetValue>("custom");

  useEffect(() => {
    if (preset === "custom") {
      onChange(manualColor, manualStrength);
      return;
    }
    const [category, level] = preset.split("-") as [
      LightCategory,
      Exclude<PresetName, "Custom">,
    ];
    const config = LIGHT_PRESETS[category][level];
    onChange(config.color, config.strength);
  }, [preset]);

  const handleRemove = () => {
    setPreset("custom");
    onChange(manualColor, 0);
  };

  return (
    <div>
      {(["spot", "wall", "hidden"] as LightCategory[]).map((category) => (
        <div key={category} className="mb-4">
          <h4 className="mb-1 font-semibold">
            {category.charAt(0).toUpperCase() + category.slice(1)} Light Preset:
          </h4>
          <SegmentedControl.Root
            value={preset.startsWith(category) ? preset : "custom"}
            onValueChange={(value: LightPresetValue) => setPreset(value)}
            className="w-full"
          >
            {(["Low", "Mid", "High"] as Exclude<PresetName, "Custom">[]).map(
              (name) => (
                <SegmentedControl.Item
                  key={`${category}-${name}`}
                  value={`${category}-${name}`}
                >
                  {name}
                </SegmentedControl.Item>
              ),
            )}
            <SegmentedControl.Item value="custom">Custom</SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
      ))}

      <button
        type="button"
        className="hover:bg-gray-100 mt-2 rounded border px-4 py-2"
        onClick={handleRemove}
      >
        Remove Light
      </button>
    </div>
  );
};

export default LightPresetSelector;
