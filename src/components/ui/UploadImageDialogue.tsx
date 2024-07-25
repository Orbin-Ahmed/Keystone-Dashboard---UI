"use client";
import React, { useEffect, useState } from "react";
import { Dialog, Flex, Select, Spinner, TextField } from "@radix-ui/themes";
import CustomButton from "../CustomButton";
import { ToastContainer, toast } from "react-toastify";
import { postImageFile } from "@/api";
import { ImageFiles } from "@/types";

type CustomDialogProps = {
  title: string;
  objectFlag?: boolean;
};

const UploadImageDialogue = ({
  title,
  objectFlag = false,
}: CustomDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);
  const [nationality, setNationality] = useState("emirati");
  const [objectType, setObjectType] = useState("door");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [theme, setTheme] = useState("");
  const [imageFiles, setImageFiles] = useState<ImageFiles[]>([]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newImageFiles: ImageFiles[] = selectedFiles.map((file) => {
      const commonFields: ImageFiles = {
        photo: file,
        style,
        source: "Designer",
        is_url: "false",
        is_object: objectFlag ? "true" : "false",
      };

      if (objectFlag) {
        return {
          ...commonFields,
          object_type: objectType,
        };
      } else {
        return {
          ...commonFields,
          nationality,
          room_type: roomType,
          theme,
        };
      }
    });

    setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (imageFiles.length === 0) {
      console.error("No images uploaded");
      return;
    }

    setIsLoading(true);

    try {
      await postImageFile(imageFiles);
      setImageFiles([]);
    } catch (error) {
      console.error("Error posting images:", error);
    } finally {
      setIsLoading(false);
      setShouldClose(true);
    }
  };

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
    <>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>

        <form onSubmit={handleSubmit}>
          <div className="my-4 flex items-center justify-between">
            {objectFlag && (
              <Select.Root
                defaultValue="door"
                onValueChange={setObjectType}
                required
              >
                <Select.Trigger color="gray" radius="large" />
                <Select.Content color="gray" variant="solid">
                  <Select.Item value="door">Door</Select.Item>
                  <Select.Item value="window">window</Select.Item>
                  <Select.Item value="floor cabinets">
                    Floor Cabinets
                  </Select.Item>
                  <Select.Item value="top cabinets">Top Cabinets</Select.Item>
                </Select.Content>
              </Select.Root>
            )}
            {!objectFlag && (
              <TextField.Root
                radius="large"
                variant="surface"
                placeholder="Room Type"
                name="room_type"
                id="room_type"
                onChange={(e) => setRoomType(e.target.value)}
                required
              />
            )}

            <TextField.Root
              radius="large"
              variant="surface"
              placeholder="style"
              name="style"
              id="style"
              onChange={(e) => setStyle(e.target.value)}
              required
            />

            {!objectFlag && (
              <TextField.Root
                radius="large"
                variant="surface"
                placeholder="Theme"
                name="theme"
                id="theme"
                onChange={(e) => setTheme(e.target.value)}
                required
              />
            )}
          </div>

          <div className="mb-8 mt-4 flex items-center justify-between">
            {!objectFlag && (
              <Select.Root
                defaultValue="emirati"
                onValueChange={setNationality}
                required
              >
                <Select.Trigger color="gray" radius="large" />
                <Select.Content color="gray" variant="solid">
                  <Select.Item value="emirati">Emirati</Select.Item>
                </Select.Content>
              </Select.Root>
            )}
            <div>
              <input
                id="images"
                className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
                type="file"
                multiple
                onChange={handleImageUpload}
                required
              />
            </div>
          </div>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <CustomButton variant="tertiary">Close</CustomButton>
            </Dialog.Close>
            <CustomButton type="submit" disabled={isLoading}>
              <div className="flex items-center justify-center">
                <span className="mr-2">Submit</span>
                <Spinner loading={isLoading}></Spinner>
              </div>
            </CustomButton>
          </Flex>
        </form>
      </Dialog.Content>
      {/* Toast area start */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="light"
      />{" "}
      {/* Toast area end */}
    </>
  );
};

export default UploadImageDialogue;
