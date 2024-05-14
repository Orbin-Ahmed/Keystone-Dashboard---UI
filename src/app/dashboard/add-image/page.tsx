"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tab from "@/components/Tab";
import SearchBar, { ImageObject } from "@/components/SearchBar";
import { useEffect, useState } from "react";

type Props = {};

const AddImage = (props: Props) => {
  const [imageSource, setImageSource] = useState("Pinterest");
  const [pexelsImagesSrc, setPexelsImagesSrc] = useState<ImageObject[]>([]);
  const [unsplashImagesSrc, setUnsplashImagesSrc] = useState<ImageObject[]>([]);

  const handleSourceChange = (newValue: string) => {
    if (
      newValue === "Pexels" ||
      newValue === "Unsplash" ||
      newValue === "Pinterest" ||
      newValue === "Pixabay"
    ) {
      setImageSource(newValue);
    } else {
      console.error("Invalid source value");
    }
  };

  const handleImagesSrc = (images: ImageObject[]) => {
    setPexelsImagesSrc(images);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Dream Space" />
        <SearchBar handleSetImagesSrc={handleImagesSrc} />
        <div>
          <Tab
            imagesSrc={pexelsImagesSrc}
            handleSourceChange={handleSourceChange}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddImage;
