"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CustomButton from "@/components/CustomButton";
import { uid } from "uid";
import { ModelViewer } from "@/components/ModelViewer";
import { Spinner } from "@radix-ui/themes";

const GenerateModel = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [glbUrl, setGlbUrl] = useState<string>("");
  const [currentImageID, setCurrentImageID] = useState<string | null>(null);
  const [hasPending, setHasPending] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    const imageID = uid(11);

    images.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("imageID", imageID);
    setCurrentImageID(imageID);
    setHasPending(true);

    try {
      const response = await fetch("/api/generate-model", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate the model.");
      } else {
        console.log("Processing");
      }
    } catch (error) {
      console.error("Error generating model:", error);
    }
  };

  useEffect(() => {
    if (!hasPending || !currentImageID) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/get-3d-model/?imageID=${currentImageID}`,
        );
        if (!res.ok) {
          console.error("Error fetching 3D model status");
          return;
        }
        const data = await res.json();

        if (data.glbUrl && data.glbUrl !== "pending") {
          setGlbUrl(data.glbUrl);
          setHasPending(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasPending, currentImageID]);

  return (
    <DefaultLayout>
      <div className="mx-auto p-4">
        <Breadcrumb pageName="Virtual Showcase" />

        <div className="mt-8 flex justify-center space-x-6">
          {/* Left Section: Upload Images */}
          <div className="w-1/2">
            <div>
              <p className="text-lg font-bold">Upload Images</p>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 justify-items-center gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative h-48 w-48">
                  <Image
                    src={preview}
                    alt={`Uploaded Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-1/2">
            <div className="mt-8 flex space-x-4">
              <CustomButton
                onClick={handleGenerate}
                variant="primary"
                disabled={hasPending}
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">
                    {!hasPending ? "Generate 3D" : "Please wait"}
                  </span>
                  <Spinner loading={hasPending}></Spinner>
                </div>
              </CustomButton>

              {glbUrl && (
                <CustomButton
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = glbUrl;
                    link.download = "3d_model.glb";
                    link.click();
                  }}
                >
                  Download 3D Model
                </CustomButton>
              )}
            </div>
            <div className="mt-6 h-[600px] overflow-hidden rounded-md border">
              {glbUrl ? (
                <Canvas>
                  <PerspectiveCamera position={[2, 2, 2]} />
                  <OrbitControls autoRotate autoRotateSpeed={1} />
                  <Environment preset="lobby" background={false} />
                  <ModelViewer glbUrl={glbUrl} />
                  <gridHelper args={[10, 10]} />
                </Canvas>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-gray-500">
                    {hasPending
                      ? "Generating 3D model... please wait."
                      : "No 3D model generated yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GenerateModel;
