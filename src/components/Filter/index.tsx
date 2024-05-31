"use client";
import { getAllImage } from "@/api";
import { Select, TextField } from "@radix-ui/themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import CustomButton from "../CustomButton";
import { ImageData } from "@/types";

type FilterProps = {
  onAddImage: (newImages: ImageData[]) => void;
};

const Filter = ({ onAddImage }: FilterProps) => {
  const [roomType, setRoomType] = useState("");
  const [source, setSource] = useState("");

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomType(e.target.value);
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
  };

  const handleFilter = () => {
    const params: { [key: string]: string } = {};
    if (roomType) params.room_type = roomType.toLowerCase();
    if (source) params.source = source;
    getData(params);
  };

  const handleReset = () => {
    setRoomType("");
    setSource("");
    getData();
  };

  const getData = async (params?: { [key: string]: string }) => {
    try {
      const response = await getAllImage(params);
      onAddImage(response);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [source]);

  return (
    <>
      <div className="mb-4 mt-4 flex flex-col items-center justify-end gap-4 2xsm:flex-row">
        <div>
          <TextField.Root
            placeholder="Room Type"
            color="gray"
            radius="full"
            value={roomType}
            onChange={handleRoomTypeChange}
          >
            <TextField.Slot
              color="gray"
              onClick={handleFilter}
              className="cursor-pointer"
            >
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
        <div className="flex items-center justify-center gap-4">
          <div>
            <Select.Root value={source} onValueChange={handleSourceChange}>
              <Select.Trigger variant="soft" placeholder="ALL" />
              <Select.Content position="popper">
                <Select.Item value="Pinterest">Pinterest</Select.Item>
                <Select.Item value="Pexels">Pexels</Select.Item>
                <Select.Item value="Unsplash">Unsplash</Select.Item>
                <Select.Item value="Pixabay">Pixabay</Select.Item>
                <Select.Item value="Designer">Designer</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div>
            <CustomButton
              type="button"
              onClick={handleReset}
              className="px-4 py-1"
            >
              Reset
            </CustomButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Filter;
