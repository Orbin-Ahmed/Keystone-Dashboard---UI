"use client";
import { runInteriorDesignModel } from "@/api";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { InteriorDesignInput } from "@/types";
import { RadioCards, TextArea } from "@radix-ui/themes";
import Image from "next/image";
import React, { useState } from "react";

type RevampProps = {};

const Revamp = ({}: RevampProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [seed, setSeed] = useState<string>("0");
  const [prompt, setPrompt] = useState<string>("");
  const [guidanceScale, setGuidanceScale] = useState<number>(15);
  const [negativePrompt, setNegativePrompt] = useState<string>(
    "lowres, watermark, banner, logo, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, unrealistic, cartoon, anime, sketch, drawing, semi-realistic, worst quality, low quality, jpeg artifacts, over-saturation",
  );
  const [promptStrength, setPromptStrength] = useState<number>(0.8);
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(40);
  const [theme, setTheme] = useState<string>("Contemporary");
  const [roomType, setRoomType] = useState<string>("Living Room");
  const [numDesigns, setNumDesigns] = useState<string>("1");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const extraPrompt =
      "sunny, real, realistic, 4k, 2k, 8k, ultra-detailed, photorealistic, high-definition, professional, vibrant colors, natural lighting, hyper-realistic,";
    const input: InteriorDesignInput = {
      image: selectedImage as File,
      prompt: `A ${theme} themed ${roomType} with ${prompt}, ${extraPrompt}`,
      guidance_scale: guidanceScale,
      negative_prompt: negativePrompt,
      prompt_strength: promptStrength,
      num_inference_steps: numInferenceSteps,
    };

    if (parseInt(seed) !== 0) {
      input.seed = parseInt(seed);
    }

    try {
      const output = await runInteriorDesignModel(input);
      console.log("Model output:", output);
    } catch (error) {
      console.error("Error running model:", error);
    }
  };

  return (
    <>
      <DefaultLayout>
        <div className="mx-auto">
          <Breadcrumb pageName="Design Studio / Revamp" />
          <div className="mt-12 flex">
            {/* Left Layout */}
            <div className="mr-2 flex basis-2/5 flex-col items-start justify-center">
              {/* Image Area */}
              <div>
                <p className="text-lg font-bold">Select your image</p>
                <div className="flex items-center justify-center gap-2">
                  <div>
                    <div className="mt-2">
                      <input
                        id="images"
                        className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
                        type="file"
                        onChange={handleImageChange}
                        required
                      />
                    </div>
                    <div className="mt-2">
                      {/* Image Preview Area of the selected Image */}
                      {imagePreviewUrl && (
                        <Image
                          src={imagePreviewUrl}
                          alt="Selected Image"
                          width={300}
                          height={300}
                          className="max-h-[500px] rounded border object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <InputField
                      className="w-full bg-white px-4.5 py-1"
                      type="text"
                      name="seed"
                      id="seed"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Seed"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Image Area end */}

              {/* Theme area */}
              <div className="mt-4">
                <p className="text-lg font-bold">Select your theme</p>
                <div className="mt-2">
                  <RadioCards.Root
                    defaultValue="Contemporary"
                    columns={{ initial: "2", lg: "3" }}
                    color="lime"
                    onValueChange={(value) => setTheme(value)}
                  >
                    <RadioCards.Item value="Contemporary">
                      <p className="text-sm font-medium">Contemporary</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Bohemian">
                      <p className="text-sm font-medium">Bohemian</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Coastal">
                      <p className="text-sm font-medium">Coastal</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Farmhouse">
                      <p className="text-sm font-medium">Farmhouse</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Industrial">
                      <p className="text-sm font-medium">Industrial</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Modern">
                      <p className="text-sm font-medium">Modern</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Scandinavian">
                      <p className="text-sm font-medium">Scandinavian</p>
                    </RadioCards.Item>
                  </RadioCards.Root>
                </div>
              </div>
              {/* Theme area end */}

              {/* Room Type area */}
              <div className="mt-4">
                <p className="text-lg font-bold">Select room type</p>
                <div className="mt-2">
                  <RadioCards.Root
                    defaultValue="Living Room"
                    columns={{ initial: "2", xl: "3" }}
                    color="lime"
                    onValueChange={(value) => setRoomType(value)}
                  >
                    <RadioCards.Item value="Living Room">
                      <p className="text-sm font-medium">Living Room</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Bedroom">
                      <p className="text-sm font-medium">Bedroom</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Kitchen">
                      <p className="text-sm font-medium">Kitchen</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Dining Room">
                      <p className="text-sm font-medium">Dining Room</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Drawing Room">
                      <p className="text-sm font-medium">Drawing Room</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Kid Room">
                      <p className="text-sm font-medium">Kid Room</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Bathroom">
                      <p className="text-sm font-medium">Bathroom</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="Office">
                      <p className="text-sm font-medium">Office</p>
                    </RadioCards.Item>
                  </RadioCards.Root>
                </div>
              </div>
              {/* Room Type area end */}

              {/* number of design area */}
              <div className="mt-4">
                <p className="text-lg font-bold">Select number of design</p>
                <div className="mt-2">
                  <RadioCards.Root
                    defaultValue="1"
                    columns={{ initial: "2", sm: "4" }}
                    color="lime"
                    onValueChange={(value) => setNumDesigns(value)}
                  >
                    <RadioCards.Item value="1">
                      <p className="text-sm font-medium">1</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="2">
                      <p className="text-sm font-medium">2</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="3">
                      <p className="text-sm font-medium">3</p>
                    </RadioCards.Item>
                    <RadioCards.Item value="4">
                      <p className="text-sm font-medium">4</p>
                    </RadioCards.Item>
                  </RadioCards.Root>
                </div>
              </div>
              {/* number of design area end */}
              <div className="mt-4 w-full">
                <TextArea
                  placeholder="Enter your style here..."
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <CustomButton
                variant="primary"
                className="mt-4 w-full rounded-lg"
                onClick={handleSubmit}
              >
                Generate
              </CustomButton>
            </div>
            {/* Left Layout end  */}
            {/* Right layout */}
            <div className="border-gray-300 flex basis-3/5 items-center justify-center border-l"></div>
            {/* Right layout end*/}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default Revamp;
