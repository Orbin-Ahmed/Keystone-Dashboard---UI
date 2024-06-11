"use client";
import CustomButton from "@/components/CustomButton";
import { Dialog } from "@radix-ui/themes";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  title: string;
  description: string;
};

function AddVariants({ title, description }: Props) {
  const [selectedImage, setSelectedImage] = useState<string>("/images/ph.png");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);
    }
  };

  const handleSaveImage = () => {
    // Your save logic here
  };

  return (
    <Dialog.Content>
      <div style={{ maxWidth: "800px" }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <div className="flex items-center justify-center gap-4">
          {/* Your Image  */}
          <div className="my-4 flex basis-2/5 flex-col items-center justify-center">
            <h3 className="mb-2 font-bold">Your Image</h3>
            <input
              className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
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
          </div>
          {/* Your Image end */}
          <div>
            <CustomButton className="pl-4" onClick={handleSaveImage}>
              Save
            </CustomButton>
          </div>
        </div>
      </div>
    </Dialog.Content>
  );
}

export default AddVariants;
