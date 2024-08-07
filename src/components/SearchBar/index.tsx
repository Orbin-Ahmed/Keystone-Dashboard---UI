"use client";
import {
  houzzImageData,
  pexelsImageData,
  pinterestImageData,
  pixabayImageData,
  unsplashImageData,
} from "@/api";
import React, { useEffect, useState } from "react";
import CustomButton from "../CustomButton";
import { Dialog } from "@radix-ui/themes";
import AddImageDialogue from "../ui/AddImageDialogue";
import UploadImageDialogue from "../ui/UploadImageDialogue";
import { ImageObject } from "@/types";

type SearchBarProps = {
  handleSetImagesSrc: (images: ImageObject[]) => void;
  imageSource: string;
  selectedImage?: string[];
  setTotalImage: (val: number) => void;
  currentPage: number;
};

const SearchBar = ({
  handleSetImagesSrc,
  imageSource,
  selectedImage,
  setTotalImage,
  currentPage,
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.trim());
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    fetchImage();
  };

  const fetchImage = async () => {
    if (!searchTerm) {
      return;
    } else {
      let processedImages: ImageObject[] = [];
      let results;
      let data;
      if (imageSource === "Pexels") {
        results = await pexelsImageData(searchTerm, currentPage);
        data = results.photos;
        // total_results
        setTotalImage(results.total_results);

        processedImages = data.map((result: any) => ({
          id: result.id,
          url: result.src.medium,
          lightBoxUrl: result.src.large2x,
        }));
      } else if (imageSource === "Unsplash") {
        results = await unsplashImageData(searchTerm, currentPage);
        data = results.results;
        // total
        setTotalImage(results.total);

        processedImages = data.map((result: any) => ({
          id: result.id,
          url: result.urls.small,
          lightBoxUrl: result.urls.regular,
        }));
      } else if (imageSource === "Pixabay") {
        results = await pixabayImageData(searchTerm, currentPage);
        data = results.hits;
        // total
        setTotalImage(results.total);

        processedImages = data.map((result: any) => ({
          id: result.id,
          url: result.webformatURL,
          lightBoxUrl: result.largeImageURL,
        }));
      } else if (imageSource === "Houzz") {
        results = await houzzImageData(searchTerm, currentPage);
        data = results.images;
        // images
        setTotalImage(1000);

        processedImages = data.map((url: string, index: number) => ({
          id: index,
          url: url,
          lightBoxUrl: url,
        }));
      } else {
        results = await pinterestImageData(searchTerm, currentPage);
        setTotalImage(1000);

        processedImages = results.map((result: any) => ({
          id: result.id,
          url: result.images.thumb,
          lightBoxUrl: result.images.full,
        }));
      }
      handleSetImagesSrc(processedImages);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [currentPage]);

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <form
        onSubmit={handleSubmit}
        className="my-4 flex items-center justify-center gap-4"
      >
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2"
            type="submit"
          >
            <svg
              className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                fill=""
              />
            </svg>
          </button>

          <input
            type="text"
            placeholder="Type to search..."
            className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
            onChange={handleInputChange}
          />
        </div>
      </form>
      <div className="mb-4 flex">
        {/* Upload Object Button Area  */}
        <div>
          <Dialog.Root>
            <Dialog.Trigger>
              <CustomButton className="mr-2 px-4 py-1">
                Upload Object
              </CustomButton>
            </Dialog.Trigger>
            <UploadImageDialogue
              objectFlag={true}
              title="Upload Your Own Image To Database"
            />
          </Dialog.Root>
        </div>
        {/* Upload Button Area  */}
        <div>
          <Dialog.Root>
            <Dialog.Trigger>
              <CustomButton className="mr-2 px-4 py-1">Upload</CustomButton>
            </Dialog.Trigger>
            <UploadImageDialogue title="Upload Your Own Image To Database" />
          </Dialog.Root>
        </div>
        {/* Submit Button Area  */}
        <div>
          <Dialog.Root>
            <Dialog.Trigger>
              <CustomButton className="mr-2 px-4 py-1">Submit</CustomButton>
            </Dialog.Trigger>
            <AddImageDialogue
              title="Add Selected Image To Database"
              total={selectedImage?.length}
              source={imageSource}
              selectedImage={selectedImage}
            />
          </Dialog.Root>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
