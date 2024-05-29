"use client";
import React, { useState, useRef, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { Dialog, Spinner } from "@radix-ui/themes";
import Image from "next/image";
import { extendImage, patchImage } from "@/api";
import { getSessionStorage } from "@/utils";

type Props = {
  title: string;
  description: string;
  src: string;
  id: string;
  is_url?: string;
};

function ExtendImage({ title, description, src, id, is_url = "false" }: Props) {
  const [preview, setPreview] = useState<string>("/images/ph.png");
  const [isLoading, setIsLoading] = useState(false);
  const [creds, setCreds] = useState<number>(0);

  const handleImageExtend = async () => {
    setIsLoading(true);

    if (!src) {
      console.error("No image source provided");
      setIsLoading(false);
      return;
    }

    const inputImageLink = src;

    try {
      const response = await extendImage(inputImageLink);
      if (response.data && response.data.url) {
        const outputUrl = response.data.url;
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

    let downloadUrl = preview;
    const urlParts = preview.split("/");
    let fileName = urlParts[urlParts.length - 1];

    // Check if the URL ends with '.null' and replace it with '.jpg'
    if (fileName.endsWith(".null")) {
      fileName = fileName.replace(".null", ".jpg");
      downloadUrl = downloadUrl.replace(".null", ".jpg");
    }

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

  useEffect(() => {
    const credit = getSessionStorage("Creds");
    if (credit) {
      setCreds(parseInt(credit));
    }
  }, [creds]);

  return (
    <>
      <Dialog.Content maxWidth="800px">
        <Dialog.Title>
          {title} (Credits: {creds})
        </Dialog.Title>
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
              onClick={handleImageExtend}
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

export default ExtendImage;
