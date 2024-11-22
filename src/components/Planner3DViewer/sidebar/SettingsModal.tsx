import React from "react";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";

interface SettingsModalProps {
  wallHeight: number;
  wallThickness: number;
  wallTexture: string;
  floorTexture: string;
  ceilingTexture: string;
  onWallHeightChange: (value: number) => void;
  onWallThicknessChange: (value: number) => void;
  onWallTextureChange: (value: string) => void;
  onFloorTextureChange: (value: string) => void;
  onCeilingTextureChange: (value: string) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  wallHeight,
  wallThickness,
  wallTexture,
  floorTexture,
  ceilingTexture,
  onWallHeightChange,
  onWallThicknessChange,
  onWallTextureChange,
  onFloorTextureChange,
  onCeilingTextureChange,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="border-gray-200 w-72 rounded-lg border bg-white p-6 shadow-lg">
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
            <option value="wallmap_yellow.png">Yellow Wall</option>
            <option value="walllightmap.png">White Wall</option>
            <option value="marbletiles.jpg">Brick Wall</option>
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
            {/* Add floor texture options here */}
            <option value="crema_marfi_marble_tile_1.jpg">
              Crema Marfil Marble
            </option>
            <option value="white_marble_tiles_1.jpg">White Marble Tiles</option>
            <option value="golden.jpeg">Golden Marble</option>
            <option value="white_marble.jpg">White Marble</option>
            <option value="blue.jpg">Blue Marble</option>
            <option value="white_tiles.jpg">White Tiles</option>
            <option value="hardwood.png">Wooden Floor</option>
            <option value="light_fine_wood.jpg">Light Wooden Floor</option>
            <option value="golden_marble_tiles.jpg">Golden Marble Tiles</option>
            <option value="dark_brown_marble_tiles.jpg">
              Dark Brown Marble Tiles
            </option>
            <option value="brown_marble_tiles.jpg">Brown Marble Tiles</option>
            <option value="gray_marble_tiles.jpg">Gray Marble Tiles</option>
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
            <option value="wallmap_yellow.png">Yellow Ceiling</option>
            <option value="walllightmap.png">White Ceiling</option>
          </select>
        </div>

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
