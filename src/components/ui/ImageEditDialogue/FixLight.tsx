"use client";
import React, { useState, useRef } from "react";
import CustomButton from "@/components/CustomButton";
import { Dialog } from "@radix-ui/themes";
import Image from "next/image";
import { fixLight } from "@/api";

type Props = {
  title: string;
  description: string;
  src: string;
};

function FixLight({ title, description, src }: Props) {
  const [preview, setPreview] = useState<string>("/images/ph.png");

  const handleLightFix = async () => {
    if (src) {
      const inputImageLink = src;

      try {
        const response = await fixLight(inputImageLink);
        if (response.data && response.data["2k"] && response.data["2k"].url) {
          const outputUrl = response.data["2k"].url;
          setPreview(outputUrl);
        } else {
          console.error("Error in response:", response);
        }
      } catch (error) {
        console.error("Error in object replacement:", error);
      }
    } else {
      console.error("No image source provided");
    }
  };

  return (
    <>
      <Dialog.Content maxWidth="800px">
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <div className="flex items-center justify-center gap-4">
          {/* Your Image */}
          <div className="my-4 flex basis-2/5 flex-col items-center justify-center">
            <h3 className="mb-2 font-bold">Your Image</h3>
            {preview && (
              <div
                className="relative mb-2"
                style={{ width: 300, height: 300, overflow: "hidden" }}
              >
                <Image
                  src={src}
                  alt="Selected"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
          </div>
          {/* Your Image end */}
          <div>
            <CustomButton className="pl-4" onClick={handleLightFix}>
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
                width={300}
                height={300}
                className="object-contain"
              />
            </div>
            <Dialog.Close>
              <CustomButton className="m-0 py-1.5">Save</CustomButton>
            </Dialog.Close>
          </div>
          {/* AI Response end */}
        </div>
      </Dialog.Content>
    </>
  );
}

export default FixLight;
