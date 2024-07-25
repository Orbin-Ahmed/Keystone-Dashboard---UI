"use client";
import React, { useEffect, useState } from "react";
import { Dialog, Flex, Select, Spinner, TextField } from "@radix-ui/themes";
import CustomButton from "../CustomButton";
import { postImagesURL } from "@/api";
import { ToastContainer, toast } from "react-toastify";
import { ImageData } from "@/types";

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
  const [isLoading, setIsLoading] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);
  const [nationality, setNationality] = useState("emirati");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [theme, setTheme] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedImage?.length === 0) {
      console.error("No images selected");
      return;
    }
    setIsLoading(true);

    const payload: ImageData[] = selectedImage?.map((img_url) => ({
      photo: img_url,
      source,
      nationality,
      room_type: roomType,
      style,
      theme,
      is_url: "true",
    }));

    try {
      const res = await postImagesURL(payload);

      if (res.success) {
        toast.success(res.data);
        setShouldClose(true);
      } else {
        toast.error(res.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error posting images:", error);
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
          <div className="mb-8 mt-4 flex items-center justify-between">
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
              onChange={(e) => setStyle(e.target.value)}
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

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <CustomButton type="button" variant="tertiary">
                Close
              </CustomButton>
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

export default AddImageDialogue;
