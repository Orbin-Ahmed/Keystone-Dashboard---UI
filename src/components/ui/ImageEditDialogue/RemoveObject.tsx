"use client";
import CustomButton from "@/components/CustomButton";
import { Dialog } from "@radix-ui/themes";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  title: string;
  description: string;
};

function RemoveObject({ title, description }: Props) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("/images/ph.png");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreview("");
  };
  return (
    <>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <div className="flex items-center justify-center gap-4">
          {/* Your Image  */}
          <div className="my-4 flex basis-2/5 flex-col items-center justify-center">
            <h3 className="mb-2 font-bold">Your Image</h3>
            {preview && (
              <div className="mb-2">
                <Image
                  src={preview}
                  alt="Selected"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
            )}
            <input
              className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {/* Your Image end  */}
          <div>
            <CustomButton className="pl-4">
              <svg
                className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </CustomButton>
          </div>
          {/* AI Response */}
          <div className="my-4 flex basis-2/5 flex-col items-center justify-center">
            <h3 className="mb-2 font-bold">AI Response</h3>
            <div className="mb-2">
              <Image
                src={preview}
                alt="Selected"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <Dialog.Close>
              <CustomButton className="m-0 py-1.5">Save</CustomButton>
            </Dialog.Close>
          </div>
          {/* AI Response end*/}
        </div>
      </Dialog.Content>
    </>
  );
}

export default RemoveObject;
