import React, { useState, useEffect } from "react";
import ItemCustomizationViewer, {
  Customization,
} from "./ItemCustomizationViewer";
import CustomButton from "@/components/CustomButton";

interface CustomizeItemModalProps {
  modelPath: string;
  onClose: () => void;
  onApply: (customizations: Record<string, Customization>) => void;
}

const CustomizeItemModal: React.FC<CustomizeItemModalProps> = ({
  modelPath,
  onClose,
  onApply,
}) => {
  const [customizations, setCustomizations] = useState<
    Record<string, Customization>
  >({});
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [localColor, setLocalColor] = useState<string>("#ffffff");
  const [localTextureFile, setLocalTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (localTextureFile) {
      const url = URL.createObjectURL(localTextureFile);
      setTexturePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setTexturePreview(null);
    }
  }, [localTextureFile]);

  useEffect(() => {
    setLocalColor("#ffffff");
    setLocalTextureFile(null);
  }, [selectedMesh]);

  const handleMeshSelected = (uuid: string) => {
    setSelectedMesh(uuid);
  };

  const updateCustomizationForSelectedMesh = () => {
    if (selectedMesh) {
      setCustomizations((prev) => ({
        ...prev,
        [selectedMesh]: {
          color: localColor !== "#ffffff" ? localColor : undefined,
          textureFile: localTextureFile || undefined,
        },
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Customize Item</h2>
          <button onClick={onClose} className="text-red-500">
            Close
          </button>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* 3D Viewer Section */}
          <div className="h-96 w-full md:w-2/3">
            <ItemCustomizationViewer
              modelPath={modelPath}
              customizations={customizations}
              selectedMesh={selectedMesh}
              onMeshSelected={handleMeshSelected}
            />
          </div>
          {/* Customization Controls */}
          <div className="mt-4 w-full md:mt-0 md:w-1/3 md:pl-4">
            {selectedMesh ? (
              <>
                <div className="mb-4">
                  <p className="mb-1 font-semibold">
                    Selected Mesh: {selectedMesh.slice(0, 8)}...
                  </p>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block">Color:</label>
                  <input
                    type="color"
                    value={localColor}
                    onChange={(e) => setLocalColor(e.target.value)}
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
                        setLocalTextureFile(e.target.files[0]);
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
                  onClick={updateCustomizationForSelectedMesh}
                  variant="secondary"
                >
                  Apply to Selected Mesh
                </CustomButton>
              </>
            ) : (
              <p className="mb-4">
                Click a part in the 3D viewer to select it.
              </p>
            )}
            <div className="mt-4">
              <h3 className="mb-2 font-bold">Current Customizations:</h3>
              <ul>
                {Object.entries(customizations).map(([uuid, cust]) => (
                  <li key={uuid}>
                    <strong>{uuid.slice(0, 8)}...:</strong>{" "}
                    {cust.textureFile
                      ? "Custom Texture"
                      : cust.color
                        ? `Color: ${cust.color}`
                        : "Default"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <CustomButton
                onClick={() => {
                  onApply(customizations);
                  onClose();
                }}
                variant="primary"
              >
                Apply All Customizations
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeItemModal;
