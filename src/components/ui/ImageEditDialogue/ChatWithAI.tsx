"use client";

import React, { useState, useRef } from "react";
import CustomButton from "@/components/CustomButton";
import { Dialog, Spinner } from "@radix-ui/themes";
import Image from "next/image";
import { ChatData, chatWithAI, patchImage } from "@/api";
import InputField from "@/components/InputField";

type Props = {
  title: string;
  description: string;
  src: string;
  id: string;
  is_url: string;
};

function ChatWithAI({ title, description, src, id, is_url }: Props) {
  const [preview, setPreview] = useState<string>("/images/ph.png");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>("");

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStyle(event.target.value);
  };

  const handleImagChat = async () => {
    setIsLoading(true);

    if (!src) {
      console.error("No image source provided");
      setIsLoading(false);
      return;
    }

    const inputImageLink = src;
    const stylesArray = style.split(",").map((s) => s.trim());

    const chatData: ChatData = {
      prompt: prompt,
      input_image_link: inputImageLink,
      num_outputs: 1,
      aspect_ratio: "1:1",
      studio_options: {
        style: stylesArray,
      },
    };

    try {
      const response = await chatWithAI(chatData);
      if (response.data.image.length > 0) {
        const outputUrl = response.data.image[0];
        setPreview(outputUrl);
      } else {
        console.error("Error in response:", response);
      }
    } catch (error) {
      console.error("Error in object replacement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!preview || preview === "/images/ph.png") {
      console.error("No image to download");
      return;
    }

    const urlParts = preview.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const link = document.createElement("a");
    link.href = preview;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await patchImage(preview, id, is_url);
      if (response.ok) {
      } else {
        console.log(response);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog.Content maxWidth="800px">
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <div className="mt-4 flex w-full items-center justify-around gap-4">
          <div className="mb-2">
            <InputField
              className="w-full px-4.5 py-1"
              type="text"
              name="prompt"
              id="prompt"
              placeholder="Prompt"
              onChange={handlePromptChange}
              required
            />
          </div>
          <div className="mb-2">
            <InputField
              className="w-full px-4.5 py-1"
              type="text"
              name="style"
              id="style"
              placeholder="Style"
              onChange={handleStyleChange}
              required
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          {/* Your Image */}
          <div className="my-4 flex basis-2/5 flex-col items-center justify-center">
            <h3 className="mb-2 font-bold">Your Image</h3>
            {src && (
              <div
                className="relative mb-2"
                style={{ width: 300, height: 300 }}
              >
                <Image src={src} alt="Selected" layout="fill" />
              </div>
            )}
            <div>
              <Dialog.Close>
                <CustomButton variant="tertiary" className="m-0 py-1.5">
                  Cancel
                </CustomButton>
              </Dialog.Close>
            </div>
          </div>
          {/* Your Image end */}
          <div>
            <CustomButton
              className={isLoading ? "" : "pl-4"}
              onClick={handleImagChat}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner loading={isLoading}></Spinner>
              ) : (
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
              )}
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
            <div className="flex items-center justify-between gap-4">
              <CustomButton
                variant="secondary"
                className="m-0 py-1.5"
                onClick={handleDownload}
              >
                Download
              </CustomButton>
              <CustomButton
                className="m-0 py-1.5"
                disabled={isLoading}
                onClick={handleSave}
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">Save</span>
                  <Spinner loading={isLoading}></Spinner>
                </div>
              </CustomButton>
            </div>
          </div>
          {/* AI Response end */}
        </div>
      </Dialog.Content>
    </>
  );
}

export default ChatWithAI;
