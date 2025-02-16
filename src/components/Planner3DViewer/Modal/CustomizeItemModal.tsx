import React, { useState, useEffect, useRef } from "react";
import ItemCustomizationViewer, {
  Customization,
} from "./ItemCustomizationViewer";
import CustomButton from "@/components/CustomButton";
import { FaUndo } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { PlacedItemType } from "@/types";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

type SelectionType = {
  groupName: string;
  meshes: string[];
};

type CustomizationHistory = {
  customizations: Record<string, Customization>;
  timestamp: number;
};

interface CustomizeItemModalProps {
  modelPath: string;
  onClose: () => void;
  onApply: (customizations: Record<string, Customization>) => void;
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

  const [selectedGroup, setSelectedGroup] = useState<SelectionType | null>(
    null,
  );

  const [localColor, setLocalColor] = useState<string>("#ffffff");
  const [localTextureFile, setLocalTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [modifiedScene, setModifiedScene] = useState<THREE.Object3D | null>(
    null,
  );

  useEffect(() => {
    if (localTextureFile) {
      const url = URL.createObjectURL(localTextureFile);
      setTexturePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setTexturePreview(null);
  }, [localTextureFile]);

  const handleApplyToSelectedGroup = () => {
    if (!selectedGroup) return;

    const newCustomizations = {
      ...customizations,
      [selectedGroup.groupName]: {
        color: localColor !== "#ffffff" ? localColor : undefined,
        textureFile: localTextureFile || undefined,
      },
    };

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

  const handleSaveModifiedModel = async (sceneToExport: THREE.Object3D) => {
    if (!sceneToExport) {
      console.error("No modified scene available.");
      return;
    }
    const exporter = new GLTFExporter();
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
        formData.append(
          "viewer2d_url",
          `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/viewer2d_images/${item?.name.toLowerCase().replaceAll(" ", "_")}.png`,
        );
        formData.append(
          "viewer3d_url",
          `${process.env.NEXT_PUBLIC_API_MEDIA_URL}/media/viewer3d_images/${item?.name.toLowerCase().replaceAll(" ", "_")}.png`,
        );
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/create-custom-item/`,
            {
              method: "POST",
              body: formData,
            },
          );
          if (response.ok) {
            console.log("Model uploaded successfully!");
          } else {
            console.error("Upload failed:", response.statusText);
          }
        } catch (err) {
          console.error("Error uploading model:", err);
        }
      },
      (error) => {
        console.error("Error exporting model:", error);
      },
      { binary: true },
    );
  };

  useEffect(() => {
    console.log(item);
  }, [item]);

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
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              onSceneReady={(scene) => setModifiedScene(scene)}
            />
          </div>

          <div className="mt-4 w-full md:mt-0 md:w-1/3 md:pl-4">
            {selectedGroup ? (
              <>
                <div className="mb-4">
                  <p className="mb-1 font-semibold">
                    Selected Group: {selectedGroup.groupName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ({selectedGroup.meshes.length} mesh(es) in this group)
                  </p>
                </div>
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
              </>
            ) : (
              <p className="mb-4">
                Click a part in the 3D viewer to select a group.
              </p>
            )}

            <div className="mt-4">
              <h3 className="mb-2 font-bold">Current Customizations:</h3>
              <ul>
                {Object.entries(customizations).map(([groupName, cust]) => (
                  <li key={groupName}>
                    <strong>{groupName}:</strong>{" "}
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
                onClick={async () => {
                  if (modifiedScene) {
                    await handleSaveModifiedModel(modifiedScene);
                  } else {
                    console.error("Modified scene not available");
                  }
                  onApply(customizations);
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
