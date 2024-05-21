"use client";
import React, { useState } from "react";
import { Dialog, Flex, Select, TextField } from "@radix-ui/themes";
import CustomButton from "../CustomButton";

type CustomDialogProps = {
  title: string;
};

type ImageFile = {
  file: File;
  nationality: string;
  room_type: string;
  source: string;
  temperature: string;
  theme: string;
};

const UploadImageDialogue = ({ title }: CustomDialogProps) => {
  const [nationality, setNationality] = useState("emirati");
  const [roomType, setRoomType] = useState("");
  const [temperature, setTemperature] = useState("");
  const [theme, setTheme] = useState("");
  const [color, setColor] = useState("");
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newImageFiles = selectedFiles.map((file) => ({
      file,
      nationality,
      room_type: roomType,
      source: "Designer",
      temperature,
      theme,
      color,
    }));

    setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted", imageFiles);
  };

  return (
    <Dialog.Content>
      <Dialog.Title>{title}</Dialog.Title>

      <form onSubmit={handleSubmit}>
        <div className="mt-4 flex items-center justify-between">
          <TextField.Root
            radius="large"
            variant="surface"
            placeholder="Room Type"
            name="room_type"
            id="room_type"
            onChange={(e) => setRoomType(e.target.value)}
            required
          />

          <TextField.Root
            radius="large"
            variant="surface"
            placeholder="Temperature"
            name="temperature"
            id="temperature"
            onChange={(e) => setTemperature(e.target.value)}
            required
          />

          <TextField.Root
            radius="large"
            variant="surface"
            placeholder="Theme"
            name="theme"
            id="theme"
            onChange={(e) => setTheme(e.target.value)}
            required
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <TextField.Root
            radius="large"
            variant="surface"
            placeholder="Room Color"
            name="color"
            id="color"
            onChange={(e) => setColor(e.target.value)}
          />

          <div>
            <input
              id="images"
              className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
              type="file"
              multiple
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-start">
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
        </div>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <CustomButton variant="tertiary">Close</CustomButton>
          </Dialog.Close>
          <CustomButton type="submit">Save</CustomButton>
        </Flex>
      </form>
    </Dialog.Content>
  );
};

export default UploadImageDialogue;
