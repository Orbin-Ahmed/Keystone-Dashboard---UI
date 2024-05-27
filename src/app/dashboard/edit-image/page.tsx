"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Filter from "@/components/Filter";
import ImageBox from "@/components/ImageBox";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";
import { ImageData } from "@/api";
import ImagePin from "@/components/ImagePin";
import Lightbox from "yet-another-react-lightbox";
import NextLightbox from "@/components/NextLightbox";
import { Download } from "yet-another-react-lightbox/plugins";
import { getImageUrl } from "@/utils";

type Props = {};

const EditImage = ({}: Props) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [index, setIndex] = React.useState(-1);

  const handleAddImage = (newImages: ImageData[]) => {
    setImages(newImages);
  };

  const lightboxUrlList = images.map((item) => ({
    src: getImageUrl(item.photo),
    download: `https://corsproxy.io/?${getImageUrl(item.photo)}`,
  }));

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Design Studio" />
        <Filter onAddImage={handleAddImage} />
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
    </DefaultLayout>
  );
};

export default EditImage;
