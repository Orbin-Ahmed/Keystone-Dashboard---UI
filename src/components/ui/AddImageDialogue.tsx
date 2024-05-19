"use client";
import React, { useState } from "react";
import { Dialog, Flex, Select, TextField } from "@radix-ui/themes";
import CustomButton from "../CustomButton";
import { ImageData, postImage } from "@/api";

type CustomDialogProps = {
  title: string;
  total: number | undefined;
  source: string;
  selectedImage?: string[];
};

const AddImageDialogue = ({
  title,
  total,
  source,
  selectedImage = [],
}: CustomDialogProps) => {
  const [nationality, setNationality] = useState("emirati");
  const [roomType, setRoomType] = useState("");
  const [temperature, setTemperature] = useState("");
  const [theme, setTheme] = useState("");
  const [color, setColor] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedImage?.length === 0) {
      console.error("No images selected");
      return;
    }

    const payload: ImageData[] = selectedImage?.map((img_url) => ({
      img_url,
      source,
      nationality,
      room_type: roomType,
      temperature,
      theme,
      color,
    }));

    try {
      await postImage(payload);
    } catch (error) {
      console.error("Error posting images:", error);
    }
  };

  return (
    <Dialog.Content>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        <span className="flex items-center justify-between">
          You have selected {total} images from {source}.
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
        </span>
      </Dialog.Description>

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

        <div className="mt-4 flex items-center justify-start">
          <TextField.Root
            radius="large"
            variant="surface"
            placeholder="Room Color"
            name="color"
            id="color"
            onChange={(e) => setColor(e.target.value)}
          />
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

export default AddImageDialogue;
