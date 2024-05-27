"use client";
import React, { useState, useRef } from "react";
import CustomButton from "@/components/CustomButton";
import { Dialog, Slider } from "@radix-ui/themes";
import Image from "next/image";
import { Stage, Layer, Line } from "react-konva";
import { removeObject } from "@/api";

type Props = {
  title: string;
  description: string;
  src: string;
};

type Base64String = string;

function RemoveObject({ title, description, src }: Props) {
  const [result, setResult] = useState<string>("/images/ph.png");
  const [lines, setLines] = useState<any[]>([]);
  const [strokeWidth, setStrokeWidth] = useState<number>(15);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

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

  const handleSaveMask = async () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ mimeType: "image/jpeg" });

    if (src) {
      const inputImageLink = src;

      try {
        let resizedDataURL;
        getImageDimensions(inputImageLink).then(async ({ width, height }) => {
          resizedDataURL = await resizeBase64Img(dataURL, width, height);
          const response = await removeObject(inputImageLink, dataURL);
        });
        // if (response.status === "success" && response.output_urls.length > 0) {
        //   const outputUrl = response.output_urls[0];
        //   setResult(outputUrl);
        // } else {
        //   console.error("Error in response:", response);
        // }
      } catch (error) {
        console.error("Error in object replacement:", error);
      }
    } else {
      console.error("No image source provided");
    }
  };

  // Resized the Base64 String
  function resizeBase64Img(
    base64: string,
    width: number,
    height: number,
  ): Promise<Base64String> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = base64;
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedBase64 = canvas.toDataURL("image/jpeg");
        resolve(resizedBase64);
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

  return (
    <>
      <Dialog.Content maxWidth="800px">
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <div className="flex items-center justify-between gap-6">
          <div className="mb-4">
            <h3 className="mb-2 font-bold">Adjust Brush Size</h3>
            <Slider
              defaultValue={[15]}
              color="gray"
              onValueChange={handleStrokeWidthChange}
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
            {src && (
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
                        stroke="red"
                        strokeWidth={strokeWidth}
                        tension={0.5}
                        lineCap="round"
                        globalCompositeOperation="source-over"
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            )}
          </div>
          {/* Your Image end */}
          <div>
            <CustomButton className="pl-4" onClick={handleSaveMask}>
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
                src={result}
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

export default RemoveObject;
