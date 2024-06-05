"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Filter from "@/components/Filter";
import ImageBox from "@/components/ImageBox";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";
import ImagePin from "@/components/ImagePin";
import Lightbox from "yet-another-react-lightbox";
import NextLightbox from "@/components/NextLightbox";
import { Download } from "yet-another-react-lightbox/plugins";
import { getImageUrl } from "@/utils";
import { ImageData } from "@/types";
import PaginateButton from "@/components/PaginateButton";

const EditImage = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [index, setIndex] = React.useState(-1);
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleAddImage = (newImages: ImageData[], totalImages: number) => {
    setImages(newImages);
    setTotal(totalImages);
  };

  const lightboxUrlList = images.map((item) => ({
    src: getImageUrl(item.photo),
    download: `https://corsproxy.io/?${getImageUrl(item.photo)}`,
  }));

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Design Studio" />
        <Filter
          onAddImage={handleAddImage}
          offset={offset}
          setOffset={setOffset}
          setCurrentPage={setCurrentPage}
        />
        {images?.length > 0 ? (
          <div className="mainContainer">
            {images.map((imgObject, i) => (
              <ImagePin
                pinSize="medium"
                key={imgObject.id}
                imgSrc={getImageUrl(imgObject.photo)}
                id={String(imgObject.id)}
                idx={i}
                setIndex={setIndex}
                getPage={true}
                is_url={imgObject.is_url}
              />
            ))}
          </div>
        ) : (
          <ImageBox />
        )}
        <Lightbox
          index={index}
          slides={lightboxUrlList}
          open={index >= 0}
          close={() => setIndex(-1)}
          render={{ slide: NextLightbox }}
          plugins={[Download]}
        />
      </div>
      <div className="mt-4 flex items-center justify-center">
        <PaginateButton
          total={total}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          offset={offset}
          setOffset={setOffset}
        />
      </div>
    </DefaultLayout>
  );
};

export default EditImage;
