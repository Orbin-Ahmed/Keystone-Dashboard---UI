"use client";
import React, { useState, useRef, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { Dialog, Slider, Spinner } from "@radix-ui/themes";
import Image from "next/image";
import { Stage, Layer, Line } from "react-konva";
import { addObject, patchImage } from "@/api";
import pica from "pica";
import InputField from "@/components/InputField";
import { getSessionStorage } from "@/utils";

type Props = {
  title: string;
  description: string;
  src: string;
  id: string;
  is_url: string;
};

type Base64String = string;

function AddObject({ title, description, src, is_url, id }: Props) {
  const [preview, setPreview] = useState<string>("/images/ph.png");
  const [lines, setLines] = useState<any[]>([]);
  const [strokeWidth, setStrokeWidth] = useState<number>(15);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [creds, setCreds] = useState<number>(0);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleStrokeWidthChange = (value: number[]) => {
    setStrokeWidth(value[0]);
  };

  // Brush Area Reset
  const handleResetLines = () => {
    setLines([]);
  };

  // brush Handle Function Area
  const handleMouseDown = () => {
    isDrawing.current = true;
    setLines([...lines, []]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine = lastLine.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // API Calling
  const handleSaveMask = async () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ mimeType: "image/jpeg" });
    setIsLoading(true);

    if (src) {
      const inputImageLink = src;

      try {
        const { width, height } = await getImageDimensions(inputImageLink);
        const resizedDataURL = await resizeBase64Img(dataURL, width, height);
        const response = await addObject(
          inputImageLink,
          resizedDataURL,
          prompt,
        );

        if (response.order_status == "order_complete") {
          const outputUrl = response.output_urls[0];
          setPreview(outputUrl);
        } else {
          console.error("Error in response:", response);
        }
      } catch (error) {
        console.error("Error in object replacement:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("No image source provided");
      setIsLoading(false);
    }
  };

  // Resize the Base64 String
  function resizeBase64Img(
    base64: string,
    width: number,
    height: number,
  ): Promise<Base64String> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = base64;
      img.onload = async function () {
        const picaInstance = new pica();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        try {
          const resizedImage = await picaInstance.resize(img, canvas, {
            quality: 3,
            unsharpAmount: 120,
            unsharpRadius: 0.6,
            unsharpThreshold: 2,
          });
          const resizedBase64 = resizedImage.toDataURL("image/jpeg", 1);
          resolve(resizedBase64);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
    });
  }

  // Get the image height and width
  function getImageDimensions(
    url: string,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // Download Image
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
  // Save Image to DB
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
        <div className="flex items-center justify-around gap-4">
          <div className="mb-4">
            <h3 className="mb-2 font-bold">Adjust Brush Size</h3>
            <Slider
              defaultValue={[15]}
              color="lime"
              onValueChange={handleStrokeWidthChange}
            />
          </div>
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
          <div>
            <CustomButton className="pl-4" onClick={handleResetLines}>
              Reset
            </CustomButton>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          {/* Your Image */}
          <div className="my-4 flex basis-2/5 flex-col items-center justify-center">
            <h3 className="mb-2 font-bold">Your Image</h3>
            {preview && (
              <div
                className="relative mb-2"
                style={{ width: 300, height: 300, overflow: "hidden" }}
              >
                <Image src={src} alt="Selected" layout="fill" />
                <Stage
                  width={300}
                  height={300}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  ref={stageRef}
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <Layer>
                    {lines.map((line, i) => (
                      <Line
                        key={i}
                        points={line}
                        stroke="white"
                        strokeWidth={strokeWidth}
                        tension={0.1}
                        lineCap="round"
                        globalCompositeOperation="source-over"
                      />
                    ))}
                  </Layer>
                </Stage>
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
              onClick={handleSaveMask}
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

export default AddObject;
