"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CustomButton from "@/components/CustomButton";
import VariantPin from "@/components/ImagePin/VariantPin";
import InputField from "@/components/InputField";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NextLightbox from "@/components/NextLightbox";
import { InteriorDesignInput } from "@/types";
import { RadioCards, Spinner, TextArea } from "@radix-ui/themes";
import Image from "next/image";
import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { Download } from "yet-another-react-lightbox/plugins";
import { TbArrowUpRight } from "react-icons/tb";
import PanoramicViewer from "@/components/PanoViewer";
import { handleGenerate360ViewAPI } from "@/api";

type RevampProps = {};

const Revamp = ({}: RevampProps) => {
  const [index, setIndex] = React.useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [panoImage, setPanoImage] = useState<string>("/images/test_pano.jpg");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [seed, setSeed] = useState<string>("0");
  const [prompt, setPrompt] = useState<string>("");
  const [guidanceScale, setGuidanceScale] = useState<number>(15);
  const [negativePrompt, setNegativePrompt] = useState<string>(
    "lowres, watermark, banner, logo, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, unrealistic, cartoon, anime, sketch, drawing, semi-realistic, worst quality, low quality, jpeg artifacts, over-saturation, over-exposed, unbalanced light",
  );
  const [promptStrength, setPromptStrength] = useState<number>(0.8);
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(40);
  const [theme, setTheme] = useState<string>("Contemporary");
  const [roomType, setRoomType] = useState<string>("Living Room");
  const [numDesigns, setNumDesigns] = useState<string>("1");
  const [designResults, setDesignResults] = useState<{ [key: string]: any }>(
    {},
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const extraPrompt =
      "sunny, real, realistic, 4k, 2k, 8k, ultra-detailed, photorealistic, high-definition, professional, vibrant colors, natural lighting, hyper-realistic, balanced light, eye soothing, ";
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

    const results: { [key: string]: any } = {};

    try {
      for (let i = 1; i <= parseInt(numDesigns); i++) {
        const formData = new FormData();
        formData.append("image", input.image);
        formData.append("prompt", input.prompt);
        formData.append("guidance_scale", input.guidance_scale.toString());
        formData.append("negative_prompt", input.negative_prompt);
        formData.append("prompt_strength", input.prompt_strength.toString());
        formData.append(
          "num_inference_steps",
          input.num_inference_steps.toString(),
        );

        if (input.seed !== undefined) {
          formData.append("seed", input.seed.toString());
        }

        const response = await fetch("/api/revamp", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const responseData = await response.json();
          results[`image${i}`] = responseData;
        } else {
          console.error(
            `Error running model for image${i}:`,
            response.statusText,
          );
        }
      }
      setDesignResults(results);
    } catch (error) {
      console.error("Error running model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const lightboxUrlList = Object.keys(designResults).map((key) => ({
    src: designResults[key],
    download: `https://corsproxy.io/?${designResults[key]}`,
  }));

  const handleOpen360View = (base64Image: string) => {
    try {
      const url = `/panoramic-view?imageData=${encodeURIComponent(base64Image)}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to open new tab:", error);
    }
  };

  const handleGenerate360View = async (imageSrc: string) => {
    try {
      const response = await handleGenerate360ViewAPI(
        imageSrc,
        `A ${theme} themed ${roomType} with ${prompt}`,
        true,
      );

      if (response) {
        const base64Image = response.result;
        setPanoImage(`data:image/png;base64,${base64Image}`);
      } else {
        console.error("No response received");
      }
    } catch (error) {
      console.error("Error handling 360 view generation:", error);
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
                className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">Generate </span>{" "}
                  {isLoading && <Spinner loading={isLoading}></Spinner>}
                  {!isLoading && <TbArrowUpRight className="text-xl" />}
                </div>
              </CustomButton>
            </div>
            {/* Left Layout end  */}
            {/* Right layout */}
            <div className="border-gray-300 mt-8 flex basis-3/5 flex-col items-start justify-start border-l">
              <div className="flex w-full flex-col items-center justify-center gap-4">
                {/* Wrapper 1 */}
                <div>
                  <div className="ml-4 flex w-full justify-center text-lg font-bold">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Generated Design </span>{" "}
                      {isLoading && <Spinner loading={isLoading}></Spinner>}
                    </div>
                  </div>
                  <div className="flex flex-wrap">
                    {Object.keys(designResults).map((key, index) => (
                      <div key={index} className="flex basis-1/2 p-2">
                        <div className="flex flex-col items-center justify-center">
                          <VariantPin
                            imgSrc={designResults[key]}
                            idx={index}
                            setIndex={setIndex}
                            id={key}
                            pinSize="medium"
                            is_variant={false}
                          />
                          <CustomButton
                            className="max-w-fit"
                            onClick={() =>
                              handleGenerate360View(designResults[key])
                            }
                          >
                            360 View Generate
                          </CustomButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Wrapper 1 end */}
                {/* Wrapper 2  */}
                <div className="w-full">
                  <div className="ml-4 flex w-full justify-center text-lg font-bold">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">360 View </span>{" "}
                      {isLoading && <Spinner loading={isLoading}></Spinner>}
                      {!isLoading && (
                        <TbArrowUpRight
                          className="cursor-pointer text-xl"
                          onClick={() => handleOpen360View(panoImage)}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ width: "100%", height: "500px" }}>
                    <PanoramicViewer imageSrc={panoImage} />
                  </div>
                </div>
                {/* Wrapper 2 end */}
              </div>
            </div>
            {/* Right layout end */}
          </div>
        </div>
        <Lightbox
          index={index}
          slides={lightboxUrlList}
          open={index >= 0}
          close={() => setIndex(-1)}
          render={{ slide: NextLightbox }}
          plugins={[Download]}
        />
      </DefaultLayout>
    </>
  );
};

export default Revamp;
