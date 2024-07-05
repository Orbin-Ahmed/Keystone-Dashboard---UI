"use client";
import { getVariantBaseImage } from "@/api";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ImageBox from "@/components/ImageBox";
import VariantPin from "@/components/ImagePin/VariantPin";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NextLightbox from "@/components/NextLightbox";
import { ImageData } from "@/types";
import { getImageUrl } from "@/utils";
import React, { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { Download } from "yet-another-react-lightbox/plugins";

type VariantProps = {};

const Variant = ({}: VariantProps) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [index, setIndex] = React.useState(-1);

  const lightboxUrlList =
    images.length > 0
      ? images.map((item) => ({
          src: getImageUrl(item.photo),
          download: `https://corsproxy.io/?${getImageUrl(item.photo)}`,
        }))
      : [];

  useEffect(() => {
    const handleGetBaseImage = async () => {
      try {
        const data = await getVariantBaseImage();
        setImages(data);
      } catch (error) {
        console.error("Error fetching base images:", error);
      }
    };
    handleGetBaseImage();
  }, []);

  return (
    <>
      <DefaultLayout>
        <div className="mx-auto">
          <Breadcrumb pageName="Design Studio / Variant" />
          {images?.length > 0 ? (
            <div className="mainContainer">
              {images.map((imgObject, i) => (
                <VariantPin
                  pinSize="medium"
                  key={imgObject.id}
                  imgSrc={getImageUrl(imgObject.photo)}
                  id={String(imgObject.id)}
                  idx={i}
                  setIndex={setIndex}
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
    </>
  );
};

export default Variant;
