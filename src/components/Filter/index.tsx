"use client";
import { getAllImage, ImageData } from "@/api";
import { Select, TextField } from "@radix-ui/themes";
import Image from "next/image";
import React, { useEffect } from "react";

type FilterProps = {
  onAddImage: (newImages: ImageData[]) => void;
};

const Filter = ({ onAddImage }: FilterProps) => {
  const getData = async () => {
    try {
      const response = await getAllImage();
      onAddImage(response);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className="mb-8 mt-4 flex items-center justify-end gap-4">
        <div>
          <TextField.Root
            placeholder="Search the docs…"
            color="gray"
            radius="full"
          >
            <TextField.Slot color="gray">
              <Image
                src={"/images/search.png"}
                alt={"magnifying glass"}
                width={18}
                height={18}
                className="object-contain"
              />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <div>
          <Select.Root defaultValue="pinterest">
            <Select.Trigger variant="soft" />
            <Select.Content position="popper">
              <Select.Item value="pinterest">Pinterest</Select.Item>
              <Select.Item value="pexels">pexels</Select.Item>
              <Select.Item value="unsplash">Unsplash</Select.Item>
              <Select.Item value="pixabay">Pixabay</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </>
  );
};

export default Filter;
