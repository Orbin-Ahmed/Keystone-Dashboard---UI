import Image from "next/image";
import React, { useState } from "react";
import { Button, Dialog } from "@radix-ui/themes";
import ViewVariant from "../ui/ViewVariant";
import { getVariantImageByBaseID } from "@/api";
import { VariantData } from "@/types";

type VariantPinProps = {
  imgSrc: string;
  pinSize: string;
  id: string;
  idx: number;
  is_variant?: boolean;
  setIndex: (index: number) => void;
};

const VariantPin = ({
  imgSrc,
  pinSize,
  id,
  idx,
  setIndex,
  is_variant = true,
}: VariantPinProps) => {
  const [images, setImages] = useState<VariantData[]>([]);
  const handleGetBaseImage = async () => {
    try {
      const data = await getVariantImageByBaseID(id);
      setImages(data);
    } catch (error) {
      console.error("Error fetching base images:", error);
    }
  };

  return (
    <>
      <div className={`pin ${pinSize}`}>
        <Image
          src={imgSrc}
          alt=""
          width={0}
          height={0}
          sizes="100vw"
          className="mainPic"
          onClick={() => setIndex(idx)}
        />
        {is_variant && (
          <div className="content_1 absolute right-0 top-0 flex h-[50px] w-full cursor-auto items-center justify-end bg-transparent px-4">
            <Dialog.Root>
              <Dialog.Trigger>
                <Button
                  variant="soft"
                  className="cursor-pointer bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-25"
                  onClick={handleGetBaseImage}
                >
                  <Image
                    src={"/images/icon/view.png"}
                    alt={"menu"}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </Button>
              </Dialog.Trigger>
              <ViewVariant idx={idx} images={images} />
            </Dialog.Root>
          </div>
        )}
      </div>
    </>
  );
};

export default VariantPin;
