import React, { useState, useEffect } from "react";
import ItemCustomizationViewer from "./ItemCustomizationViewer";
import CustomButton from "@/components/CustomButton";

interface CustomizeItemModalNewProps {
  modelPath: string;
  onClose: () => void;
  onApply: (color: string, textureFile?: File) => void;
}

const CustomizeItemModal: React.FC<CustomizeItemModalNewProps> = ({
  modelPath,
  onClose,
  onApply,
}) => {
  const [color, setColor] = useState<string>("#ffffff");
  const [textureFile, setTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (textureFile) {
      const url = URL.createObjectURL(textureFile);
      setTexturePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setTexturePreview(null);
    }
  }, [textureFile]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Customize Item</h2>
          <button onClick={onClose} className="text-red-500">
            Close
          </button>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="h-96 w-full md:w-2/3">
            <ItemCustomizationViewer
              modelPath={modelPath}
              color={color}
              textureFile={textureFile}
            />
          </div>
          <div className="mt-4 w-full md:mt-0 md:w-1/3 md:pl-4">
            <div className="mb-4">
              <label className="mb-1 block">Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block">Upload Texture:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setTextureFile(e.target.files[0]);
                  }
                }}
              />
              {texturePreview && (
                <img
                  src={texturePreview}
                  alt="Texture Preview"
                  className="mt-2 h-24 w-24 border object-cover"
                />
              )}
            </div>
            <CustomButton
              onClick={() => {
                onApply(color, textureFile || undefined);
                onClose();
              }}
              variant="primary"
            >
              Apply
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeItemModal;
