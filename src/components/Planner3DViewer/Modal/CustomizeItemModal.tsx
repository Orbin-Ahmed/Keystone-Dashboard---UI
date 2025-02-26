import React, { useState, useEffect, useRef } from "react";
import ItemCustomizationViewer, {
  Customization,
  SelectionType,
} from "./ItemCustomizationViewer";
import CustomButton from "@/components/CustomButton";
import { FaUndo } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { PlacedItemType } from "@/types";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

type CustomizationHistory = {
  customizations: Record<string, Customization>;
  timestamp: number;
};

interface CustomizeItemModalProps {
  modelPath: string;
  onClose: () => void;
  onApply: (
    customizations: Record<string, Customization>,
    newItemName: string,
  ) => void;
  item?: PlacedItemType;
}

const CustomizeItemModal: React.FC<CustomizeItemModalProps> = ({
  modelPath,
  onClose,
  onApply,
  item,
}) => {
  const [customizations, setCustomizations] = useState<
    Record<string, Customization>
  >({});
  const [history, setHistory] = useState<CustomizationHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [selectedGroups, setSelectedGroups] = useState<SelectionType[]>([]);

  const [localColor, setLocalColor] = useState<string>("#ffffff");
  const [localBrightness, setLocalBrightness] = useState<number>(50);
  const [localTextureFile, setLocalTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [modifiedScene, setModifiedScene] = useState<THREE.Object3D | null>(
    null,
  );
  const [displayedCustomizations, setDisplayedCustomizations] = useState<
    Array<{ groupName: string; cust: Customization }>
  >([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState<number>(0);

  useEffect(() => {
    if (localTextureFile) {
      const url = URL.createObjectURL(localTextureFile);
      setTexturePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setTexturePreview(null);
  }, [localTextureFile]);

  useEffect(() => {
    const customizationEntries = Object.entries(customizations).map(
      ([groupName, cust]) => ({ groupName, cust }),
    );
    setDisplayedCustomizations(customizationEntries);
    setCurrentDisplayIndex(0);
  }, [customizations]);

  useEffect(() => {
    if (displayedCustomizations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentDisplayIndex(
        (prevIndex) => (prevIndex + 1) % displayedCustomizations.length,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [displayedCustomizations]);

  const handleApplyToSelectedGroup = () => {
    if (selectedGroups.length === 0) return;

    const newCustomizations = { ...customizations };
    selectedGroups.forEach((group) => {
      newCustomizations[group.groupName] = {
        color: localColor !== "#ffffff" ? localColor : undefined,
        brightness: localBrightness,
        textureFile: localTextureFile || undefined,
      };
    });

    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push({
      customizations: newCustomizations,
      timestamp: Date.now(),
    });

    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setCustomizations(newCustomizations);
  };

  const handleRevert = () => {
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1];
      setCustomizations(previousState.customizations);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    } else if (currentHistoryIndex === 0) {
      setCustomizations({});
      setCurrentHistoryIndex(-1);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value);
    setLocalTextureFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBrightness(Number(e.target.value));
  };

  const handleSaveModifiedModel = async (
    sceneToExport: THREE.Object3D,
  ): Promise<string> => {
    if (!sceneToExport) {
      console.error("No modified scene available.");
      return "";
    }

    const exporter = new GLTFExporter();

    return new Promise((resolve) => {
      exporter.parse(
        sceneToExport,
        async (result) => {
          let blob: Blob;
          if (result instanceof ArrayBuffer) {
            blob = new Blob([result], { type: "model/gltf-binary" });
          } else {
            const output = JSON.stringify(result, null, 2);
            blob = new Blob([output], { type: "application/json" });
          }

          const formData = new FormData();
          formData.append("glb_file", blob, "modifiedModel.glb");

          if (item?.name) {
            const baseName = item.name.toLowerCase().replaceAll(" ", "_");
            formData.append(
              "viewer2d_url",
              `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/viewer2d_images/${baseName}.png`,
            );
            formData.append(
              "viewer3d_url",
              `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/viewer3d_images/${baseName}.png`,
            );
          }

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}api/create-custom-item/`,
              {
                method: "POST",
                body: formData,
              },
            );

            if (response.ok) {
              const data = await response.json();
              const newItemName = data.item_name;
              console.log("Model uploaded successfully!", newItemName);

              resolve(newItemName);
            } else {
              console.error("Upload failed:", response.statusText);
              resolve("");
            }
          } catch (err) {
            console.error("Error uploading model:", err);
            resolve("");
          }
        },
        (error) => {
          console.error("Error exporting model:", error);
          resolve("");
        },
        { binary: true },
      );
    });
  };

  const canRevert = currentHistoryIndex >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Customize Item (Group-Based)</h2>
          </div>
          <button onClick={onClose}>
            <GrClose />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="h-96 w-full md:w-2/3">
            <ItemCustomizationViewer
              modelPath={modelPath}
              customizations={customizations}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
              onSceneReady={(scene) => setModifiedScene(scene)}
            />
          </div>

          <div className="mt-4 w-full md:mt-0 md:w-1/3 md:pl-4">
            {selectedGroups.length > 0 ? (
              <div className="mb-4">
                {selectedGroups.length === 1 ? (
                  <>
                    <p className="mb-1 font-semibold">
                      Selected Group: {selectedGroups[0].groupName}
                    </p>
                    <p className="text-gray-500 text-sm">
                      ({selectedGroups[0].meshes.length} mesh(es) in this group)
                    </p>
                  </>
                ) : (
                  <p className="mb-1 font-semibold">
                    {selectedGroups.length} groups selected
                  </p>
                )}
              </div>
            ) : (
              <p className="mb-4">
                Click a part in the 3D viewer to select a group (hold Ctrl for
                multiple selection).
              </p>
            )}

            <div className="mb-4">
              <label className="mb-1 block">Color:</label>
              <input
                type="color"
                value={localColor}
                onChange={handleColorChange}
                className="h-10 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block">
                Brightness:{" "}
                {localBrightness < 50
                  ? "Darker"
                  : localBrightness > 50
                    ? "Lighter"
                    : "Normal"}
                ({localBrightness}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={localBrightness}
                onChange={handleBrightnessChange}
                className="w-full"
              />
              <div className="text-gray-500 flex justify-between text-xs">
                <span>Darker</span>
                <span>Normal</span>
                <span>Lighter</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block">Upload Texture:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setLocalTextureFile(e.target.files[0]);
                    setLocalColor("#ffffff");
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

            <div className="mb-4 flex items-center justify-between gap-4">
              <CustomButton
                onClick={handleApplyToSelectedGroup}
                variant="secondary"
                disabled={selectedGroups.length === 0}
              >
                Preview
              </CustomButton>
              <CustomButton
                onClick={handleRevert}
                variant="secondary"
                disabled={!canRevert}
                className="flex items-center gap-2"
              >
                <FaUndo className="h-4 w-4" />
              </CustomButton>
            </div>

            {/* Fixed customization display area with animation */}
            <div className="mt-4 h-24 overflow-hidden border p-2">
              <h3 className="mb-2 font-bold">Current Customizations:</h3>
              {displayedCustomizations.length > 0 ? (
                <div className="transition-opacity duration-500">
                  {displayedCustomizations.length > 0 && (
                    <div key={currentDisplayIndex} className="animate-fadeIn">
                      <strong>
                        {displayedCustomizations[currentDisplayIndex].groupName}
                        :
                      </strong>{" "}
                      {displayedCustomizations[currentDisplayIndex].cust
                        .textureFile
                        ? "Custom Texture"
                        : displayedCustomizations[currentDisplayIndex].cust
                              .color
                          ? `Color: ${displayedCustomizations[currentDisplayIndex].cust.color}, 
                           Brightness: ${displayedCustomizations[currentDisplayIndex].cust.brightness ?? 50}%`
                          : "Default"}
                    </div>
                  )}
                  {displayedCustomizations.length > 1 && (
                    <div className="mt-2 flex">
                      {displayedCustomizations.map((_, index) => (
                        <div
                          key={index}
                          className={`mx-1 h-2 w-2 rounded-full ${
                            index === currentDisplayIndex
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No customizations applied yet</p>
              )}
            </div>

            <div className="mt-4">
              <CustomButton
                onClick={async () => {
                  let newItemName = "";
                  if (modifiedScene) {
                    newItemName = await handleSaveModifiedModel(modifiedScene);
                  } else {
                    console.error("Modified scene not available");
                  }
                  onApply(customizations, newItemName);
                  onClose();
                }}
                variant="primary"
                className="float-end"
              >
                Save
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeItemModal;
