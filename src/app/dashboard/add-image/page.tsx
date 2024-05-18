"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tab from "@/components/Tab";
import SearchBar, { ImageObject } from "@/components/SearchBar";
import { useEffect, useState } from "react";

type Props = {};

const AddImage = (props: Props) => {
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [imageSource, setImageSource] = useState("Pinterest");
  const [pexelsImagesSrc, setPexelsImagesSrc] = useState<ImageObject[]>([]);
  const [unsplashImagesSrc, setUnsplashImagesSrc] = useState<ImageObject[]>([]);
  const [pinterestImagesSrc, setPinterestImagesSrc] = useState<ImageObject[]>(
    [],
  );
  const [pixabayImagesSrc, setPixabayImagesSrc] = useState<ImageObject[]>([]);

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
    if (imageSource === "Pexels") {
      setPexelsImagesSrc(images);
    } else if (imageSource === "Unsplash") {
      setUnsplashImagesSrc(images);
    } else if (imageSource === "Pixabay") {
      setPixabayImagesSrc(images);
    } else {
      console.log("hi");
    }
  };

  useEffect(() => {
    console.log(selectedImage);
  }, [selectedImage]);

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Dream Space" />
        <SearchBar
          handleSetImagesSrc={handleImagesSrc}
          imageSource={imageSource}
        />
        <div>
          <Tab
            setSelectedImage={setSelectedImage}
            pinterestImagesSrc={pinterestImagesSrc}
            unsplashImagesSrc={unsplashImagesSrc}
            pexelsImagesSrc={pexelsImagesSrc}
            pixabayImagesSrc={pixabayImagesSrc}
            imageSource={imageSource}
            handleSourceChange={handleSourceChange}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddImage;
