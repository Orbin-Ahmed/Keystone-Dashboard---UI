import React, { useState, useEffect } from "react";
import { SegmentedControl } from "@radix-ui/themes";

export type LightCategory = "spotLight" | "wallLight" | "hiddenLight";
export type SpotPreset = "Warm" | "Focus" | "Dramatic";
export type WallPreset = "Cozy" | "Neutral" | "Cool";
export type HiddenPreset = "Subtle" | "Accent" | "Vibrant";

export type LightPresetValue =
  | `spotLight-${SpotPreset}`
  | `wallLight-${WallPreset}`
  | `hiddenLight-${HiddenPreset}`
  | "custom";

export interface PresetConfig {
  emissionColor: string;
  emissionStrength: number;
}

const LIGHT_PRESETS: {
  spotLight: Record<SpotPreset, PresetConfig>;
  wallLight: Record<WallPreset, PresetConfig>;
  hiddenLight: Record<HiddenPreset, PresetConfig>;
} = {
  spotLight: {
    Warm: { emissionColor: "#FFA500", emissionStrength: 100 },
    Focus: { emissionColor: "#FF8C00", emissionStrength: 500 },
    Dramatic: { emissionColor: "#FF4500", emissionStrength: 1000 },
  },
  wallLight: {
    Cozy: { emissionColor: "#87CEEB", emissionStrength: 200 },
    Neutral: { emissionColor: "#1E90FF", emissionStrength: 600 },
    Cool: { emissionColor: "#0000FF", emissionStrength: 1200 },
  },
  hiddenLight: {
    Subtle: { emissionColor: "#7FFF00", emissionStrength: 300 },
    Accent: { emissionColor: "#00FF7F", emissionStrength: 700 },
    Vibrant: { emissionColor: "#00FF00", emissionStrength: 1500 },
  },
};

interface LightPresetSelectorProps {
  preset: LightPresetValue;
  onPresetChange: (preset: LightPresetValue) => void;
  manualColor: string;
  manualStrength: number;
  onChange: (color: string, strength: number) => void;
}

const LightPresetSelector: React.FC<LightPresetSelectorProps> = ({
  manualColor,
  manualStrength,
  onChange,
  preset,
  onPresetChange,
}) => {
  useEffect(() => {
    if (preset === "custom") {
      return;
    }
    const [category, name] = preset.split("-") as [LightCategory, any];
    const config = (LIGHT_PRESETS[category] as any)[name];
    if (config) onChange(config.emissionColor, config.emissionStrength);
  }, [preset]);

  return (
    <div>
      {(["spotLight", "wallLight", "hiddenLight"] as LightCategory[]).map(
        (category) => {
          const names = Object.keys(LIGHT_PRESETS[category]) as string[];
          return (
            <div key={category} className="mb-4">
              <h4 className="mb-1 font-semibold">
                {category.replace(/([A-Z])/g, " $1").trim()} Presets:
              </h4>
              <SegmentedControl.Root
                value={preset.startsWith(category) ? preset : "custom"}
                onValueChange={(value: LightPresetValue) =>
                  onPresetChange(value)
                }
                className="w-full"
              >
                {names.map((name) => (
                  <SegmentedControl.Item
                    key={`${category}-${name}`}
                    value={`${category}-${name}` as LightPresetValue}
                  >
                    {name}
                  </SegmentedControl.Item>
                ))}
                <SegmentedControl.Item value="custom">
                  Custom
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </div>
          );
        },
      )}
    </div>
  );
};

export default LightPresetSelector;
