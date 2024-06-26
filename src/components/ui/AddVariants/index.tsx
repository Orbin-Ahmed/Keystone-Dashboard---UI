"use client";
import { postVariant } from "@/api";
import Chips from "@/components/Chips";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { Dialog, Select } from "@radix-ui/themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type Props = {
  title: string;
  description: string;
  id: string;
};

type Data = Record<string, string>;

function AddVariants({ title, description, id }: Props) {
  const [selectedImage, setSelectedImage] = useState<string>("/images/ph.png");
  const [data, setData] = useState<Data>({});
  const [selectedVariant, setSelectedVariant] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shouldClose, setShouldClose] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);
      setImageFile(file);
    }
  };

  const handleAddData = () => {
    if (selectedVariant && inputValue) {
      setData((prevData) => ({
        ...prevData,
        [selectedVariant]: inputValue,
      }));
      setSelectedVariant("");
      setInputValue("");
    }
  };

  const handleRemoveChip = (key: string): void => {
    setData((prevData) => {
      const newData = { ...prevData };
      delete newData[key];
      return newData;
    });
  };

  const handleSaveImage = async () => {
    if (!imageFile) {
      console.error("No image file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("base_image", id.toString());
    formData.append("variant_image", imageFile);
    formData.append("data", JSON.stringify(data));

    try {
      await postVariant(formData);
      setShouldClose(true);
    } catch (error) {
      setShouldClose(false);
    }
  };

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        setShouldClose(false);
      }
    };

    let timeoutId: NodeJS.Timeout | null = null;

    if (shouldClose) {
      timeoutId = setTimeout(() => {
        handleEscape(new KeyboardEvent("keydown", { key: "Escape" }));
      });
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldClose]);

  return (
    <Dialog.Content>
      <div style={{ maxWidth: "800px" }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        {/* Input Area  */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <input
              className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <InputField
              className="w-full px-3.5 py-1"
              type="text"
              name="value"
              id="value"
              placeholder="Enter Variant Details"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col items-end justify-center gap-4">
            <Select.Root
              value={selectedVariant}
              onValueChange={setSelectedVariant}
            >
              <Select.Trigger variant="soft" placeholder="Select Variant" />
              <Select.Content position="popper">
                {/* Grouped Items */}
                <Select.Group>
                  <Select.Label>Storage Solutions</Select.Label>
                  <Select.Separator />
                  <Select.Item value="storage-units">Storage Units</Select.Item>
                  <Select.Item value="closet">Closet</Select.Item>
                  <Select.Item value="shelves">Shelves</Select.Item>
                  <Select.Item value="cabinets">Cabinets</Select.Item>
                  <Select.Item value="drawers">Drawers</Select.Item>
                  <Select.Item value="pantry">Pantry</Select.Item>
                </Select.Group>

                <Select.Group>
                  <Select.Label>Kitchen Elements</Select.Label>
                  <Select.Separator />
                  <Select.Item value="kitchen-island">
                    Kitchen Island
                  </Select.Item>
                </Select.Group>

                <Select.Group>
                  <Select.Label>Bathroom Elements</Select.Label>
                  <Select.Separator />
                  <Select.Item value="bathroom-vanities">
                    Bathroom Vanities
                  </Select.Item>
                  <Select.Item value="bath-paneling">Bath Paneling</Select.Item>
                  <Select.Item value="towel-racks">Towel Racks</Select.Item>
                  <Select.Item value="accessories">Accessories</Select.Item>
                </Select.Group>

                <Select.Group>
                  <Select.Label>Wall</Select.Label>
                  <Select.Separator />
                  <Select.Item value="wall-art">Art</Select.Item>
                  <Select.Item value="wall-panels">Panels</Select.Item>
                  <Select.Item value="wall-grilles">Grilles</Select.Item>
                  <Select.Item value="wall-sculptures">Sculptures</Select.Item>
                  <Select.Item value="wall-cladding">Cladding</Select.Item>
                  <Select.Item value="wall-moldings-trim">Moldings</Select.Item>
                  <Select.Item value="wall-trim">Trim</Select.Item>
                  <Select.Item value="wall-wainscoting">
                    Wainscoting
                  </Select.Item>
                  <Select.Item value="wall-accent-walls">
                    Accent Walls
                  </Select.Item>
                </Select.Group>

                <Select.Group>
                  <Select.Label>MISC</Select.Label>
                  <Select.Separator />
                  <Select.Item value="room-dividers-screens">
                    Room Dividers and Screens
                  </Select.Item>
                  <Select.Item value="doors-windows">
                    Doors & Windows
                  </Select.Item>
                  <Select.Item value="ceiling">Ceiling</Select.Item>
                  <Select.Item value="beams-trusses">
                    Beams & Trusses
                  </Select.Item>
                  <Select.Item value="staircases">Staircases</Select.Item>
                  <Select.Item value="railings">Railings</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
            <CustomButton onClick={handleAddData}>
              <Image
                alt="add"
                src="/images/icon/plus.png"
                width={16}
                height={16}
              />
            </CustomButton>
          </div>
        </div>
        {/* Input Area end */}
        <div className="flex items-center justify-center gap-4">
          {/* Your Image  */}
          <div className="mt-4 flex basis-2/4 flex-col items-center justify-center">
            <div
              className="relative mb-2"
              style={{ width: 300, height: 300, overflow: "hidden" }}
            >
              <Image
                src={selectedImage}
                alt="Selected"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="flex gap-4">
              <Dialog.Close>
                <CustomButton variant="tertiary" onClick={handleSaveImage}>
                  Cancel
                </CustomButton>
              </Dialog.Close>
              <CustomButton onClick={handleSaveImage}>Save</CustomButton>
            </div>
          </div>
          {/* Your Image end */}
          <div className="flex basis-2/4 flex-wrap gap-4">
            {Object.entries(data).map(([key, value]) => (
              <Chips
                key={key}
                value={`${key}: ${value}`}
                onRemove={() => handleRemoveChip(key)}
              />
            ))}
          </div>
        </div>
      </div>
    </Dialog.Content>
  );
}

export default AddVariants;
