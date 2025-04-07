import React, { useState, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";

interface TextureData {
  texture_name: string;
  texture_file: string;
  texture_type: string;
}

interface SettingsModalProps {
  wallHeight: number;
  wallThickness: number;
  wallTexture: string;
  floorTexture: string;
  ceilingTexture: string;
  lightIntensity: number;
  windowHeight: number;
  onWindowHeightChange: (value: number) => void;
  onWallHeightChange: (value: number) => void;
  onWallThicknessChange: (value: number) => void;
  onWallTextureChange: (value: string) => void;
  onFloorTextureChange: (value: string) => void;
  onCeilingTextureChange: (value: string) => void;
  onLightIntensityChange: (value: number) => void;
  onClose: () => void;
  onShowHiddenItems: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  wallHeight,
  wallThickness,
  wallTexture,
  floorTexture,
  ceilingTexture,
  lightIntensity,
  onWallHeightChange,
  onWallThicknessChange,
  onWallTextureChange,
  onFloorTextureChange,
  onCeilingTextureChange,
  onLightIntensityChange,
  onClose,
  onShowHiddenItems,
  onWindowHeightChange,
}) => {
  const [textures, setTextures] = useState<TextureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTextures = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/upload-texture/`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch textures");
        }
        const data = await response.json();
        setTextures(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    };

    fetchTextures();
  }, []);

  const filterTexturesByType = (type: string) => {
    return textures.filter((texture) => texture.texture_type === type);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="w-72 rounded-lg border bg-white p-6 shadow-lg">
          <p className="text-center">Loading textures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="w-72 rounded-lg border bg-white p-6 shadow-lg">
          <p className="text-red-500 text-center">Error: {error}</p>
          <CustomButton
            onClick={onClose}
            variant="secondary"
            className="mt-4 w-full rounded px-4 py-2 text-sm font-medium"
          >
            Close
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-72 rounded-lg border bg-white p-6 shadow-lg">
        <h3 className="text-gray-800 mb-4 text-lg font-semibold">Settings</h3>

        {/* Wall Height Input */}
        <div className="mb-4">
          <label
            htmlFor="wall_height"
            className="text-gray-700 block text-sm font-medium"
          >
            Wall Height (Inch)
          </label>
          <InputField
            className="border-gray-300 mt-2 w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            name="wall_height"
            id="wall_height"
            type="number"
            placeholder="Wall Height"
            value={wallHeight}
            onChange={(e) => onWallHeightChange(Number(e.target.value))}
          />
        </div>

        {/* Window Height Input */}
        <div className="mb-4">
          <label
            htmlFor="window_height"
            className="text-gray-700 block text-sm font-medium"
          >
            Window Height (Inch)
          </label>
          <InputField
            className="border-gray-300 mt-2 w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            name="window_height"
            id="window_height"
            type="number"
            placeholder="Window Height"
            value={wallHeight}
            onChange={(e) => onWindowHeightChange(Number(e.target.value))}
          />
        </div>

        {/* Wall Thickness Input */}
        <div className="mb-4">
          <label
            htmlFor="wall_thickness"
            className="text-gray-700 block text-sm font-medium"
          >
            Wall Thickness (Inch)
          </label>
          <InputField
            className="border-gray-300 mt-2 w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            name="wall_thickness"
            id="wall_thickness"
            type="number"
            placeholder="Wall Thickness"
            value={wallThickness}
            onChange={(e) => onWallThicknessChange(Number(e.target.value))}
          />
        </div>

        {/* Wall Texture Selection */}
        <div className="mb-4">
          <label
            htmlFor="wall_texture"
            className="text-gray-700 block text-sm font-medium"
          >
            Wall Texture
          </label>
          <select
            id="wall_texture"
            value={wallTexture}
            onChange={(e) => onWallTextureChange(e.target.value)}
            className="border-gray-300 mt-2 w-full rounded border bg-white px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
          >
            {filterTexturesByType("Wall").map((texture) => (
              <option
                key={texture.texture_name}
                value={`${process.env.NEXT_PUBLIC_API_MEDIA_URL}${texture.texture_file}`}
              >
                {texture.texture_name}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Texture Selection */}
        <div className="mb-4">
          <label
            htmlFor="floor_texture"
            className="text-gray-700 block text-sm font-medium"
          >
            Floor Texture
          </label>
          <select
            id="floor_texture"
            value={floorTexture}
            onChange={(e) => onFloorTextureChange(e.target.value)}
            className="border-gray-300 mt-2 w-full rounded border bg-white px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
          >
            {filterTexturesByType("Floor").map((texture) => (
              <option
                key={texture.texture_name}
                value={`${process.env.NEXT_PUBLIC_API_MEDIA_URL}${texture.texture_file}`}
              >
                {texture.texture_name}
              </option>
            ))}
          </select>
        </div>

        {/* Ceiling Texture Selection */}
        <div className="mb-4">
          <label
            htmlFor="ceiling_texture"
            className="text-gray-700 block text-sm font-medium"
          >
            Ceiling Texture
          </label>
          <select
            id="ceiling_texture"
            value={ceilingTexture}
            onChange={(e) => onCeilingTextureChange(e.target.value)}
            className="border-gray-300 mt-2 w-full rounded border bg-white px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
          >
            {filterTexturesByType("Ceiling").map((texture) => (
              <option
                key={texture.texture_name}
                value={`${process.env.NEXT_PUBLIC_API_MEDIA_URL}${texture.texture_file}`}
              >
                {texture.texture_name}
              </option>
            ))}
          </select>
        </div>

        {/* Light Intensity Slider */}
        <div className="mb-4">
          <label
            htmlFor="light_intensity"
            className="text-gray-700 block text-sm font-medium"
          >
            Light Intensity
          </label>
          <input
            type="range"
            id="light_intensity"
            min="0"
            max="2"
            step="0.1"
            value={lightIntensity}
            onChange={(e) => onLightIntensityChange(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <div className="text-gray-600 mt-1 text-center text-sm">
            {lightIntensity.toFixed(1)}
          </div>
        </div>

        {/* Show Hidden Items Button */}
        <CustomButton
          onClick={onShowHiddenItems}
          variant="primary"
          className="mb-4 w-full rounded px-4 py-2 text-sm font-medium text-white"
        >
          Show Hidden Items
        </CustomButton>

        {/* Close Button */}
        <CustomButton
          onClick={onClose}
          variant="secondary"
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 w-full rounded px-4 py-2 text-sm font-medium"
        >
          Close
        </CustomButton>
      </div>
    </div>
  );
};

export default SettingsModal;
