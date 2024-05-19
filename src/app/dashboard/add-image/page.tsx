"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tab from "@/components/Tab";
import SearchBar, { ImageObject } from "@/components/SearchBar";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";

type Props = {};

const AddImage = ({}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [totalImage, setTotalImage] = useState<number>(0);
  const [showingNumberFrom, setShowingNumberFrom] = useState(1);
  const [showingNumberTo, setShowingNumberTo] = useState(30);
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
      setCurrentPage(1);
      setTotalImage(0);
      setShowingNumberFrom(1);
      setShowingNumberTo(30);
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

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Dream Space" />
        <SearchBar
          currentPage={currentPage}
          handleSetImagesSrc={handleImagesSrc}
          imageSource={imageSource}
          selectedImage={selectedImage}
          setTotalImage={setTotalImage}
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
        <div className="mt-4 flex items-center justify-center">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={totalImage}
            showingNumberFrom={showingNumberFrom}
            showingNumberTo={showingNumberTo}
            setShowingNumberFrom={setShowingNumberFrom}
            setShowingNumberTo={setShowingNumberTo}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddImage;
