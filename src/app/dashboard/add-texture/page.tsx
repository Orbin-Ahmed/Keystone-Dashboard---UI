"use client";

import React, { useState } from "react";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CustomButton from "@/components/CustomButton";

const AddTexture = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [textureName, setTextureName] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage || !textureName.trim()) {
      alert(
        "Please provide a texture name and select an image before submitting.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("texture", selectedImage);
    formData.append("texture_name", textureName);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/upload-texture/`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload texture. Please try again.");
      }

      alert("Texture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading texture:", error);
      alert("An error occurred while uploading the texture.");
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto p-4">
        <Breadcrumb pageName="Interior Textures" />

        <form onSubmit={handleSubmit} className="mt-8 flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            className="w-full cursor-pointer rounded border border-stroke bg-white text-sm font-medium text-graydark file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-white file:hover:bg-primary"
            onChange={handleImageChange}
            required
          />

          <input
            type="text"
            className="w-full rounded border border-stroke px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter texture name"
            value={textureName}
            onChange={(e) => setTextureName(e.target.value)}
            required
          />

          <select
            id="type"
            name="type"
            className="w-full rounded border border-stroke px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="Wall">Wall</option>
            <option value="Floor">Floor</option>
          </select>

          <CustomButton type="submit" variant="primary">
            Submit
          </CustomButton>
        </form>

        {imagePreview && (
          <div className="relative mt-4 h-64 w-64">
            <Image
              src={imagePreview}
              alt="Selected Texture Preview"
              fill
              className="rounded object-contain"
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default AddTexture;
