import { getVariantImageByBaseID } from "@/api";
import CustomButton from "@/components/CustomButton";
import ImageBox from "@/components/ImageBox";
import { VariantData } from "@/types";
import { Dialog } from "@radix-ui/themes";
import Image from "next/image";
import React from "react";

type ViewVariantProps = {
  idx: number;
  images: VariantData[];
};

const ViewVariant = ({ images }: ViewVariantProps) => {
  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < images.length; i += 3) {
      rows.push(
        <div key={i} className="mb-4 flex justify-start gap-4 space-x-4">
          {images.slice(i, i + 3).map((imgObject, index) => (
            <div key={index} className="group relative h-60 w-60">
              <Image
                src={imgObject.variant_image}
                alt=""
                layout="fill"
                className="cursor-pointer object-cover transition duration-500 group-hover:blur-sm"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-graydark bg-opacity-75 p-2 text-center text-white opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
                {Object.entries(imgObject.data).map(([key, value]) => (
                  <div key={key}>{`${key}: ${value}`}</div>
                ))}
              </div>
            </div>
          ))}
        </div>,
      );
    }
    return rows;
  };

  return (
    <Dialog.Content maxWidth="800px">
      <div>
        <Dialog.Title>Variants</Dialog.Title>
        <Dialog.Description>
          Here are the available variants for this image
        </Dialog.Description>
        <div className="mt-4 flex flex-col items-start">
          {images?.length > 0 ? renderRows() : <ImageBox />}
          <Dialog.Close>
            <CustomButton variant="tertiary">Close</CustomButton>
          </Dialog.Close>
        </div>
      </div>
    </Dialog.Content>
  );
};

export default ViewVariant;
