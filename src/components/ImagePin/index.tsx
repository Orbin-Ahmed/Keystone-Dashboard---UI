"use client";
import { Button, Checkbox, Dialog, Popover } from "@radix-ui/themes";
import Image from "next/image";
import React from "react";
// import RemoveObject from "../ui/ImageEditDialogue/RemoveObject";
// import AddObject from "../ui/ImageEditDialogue/AddObject";
// import FixLight from "../ui/ImageEditDialogue/FixLight";
// import ExtendImage from "../ui/ImageEditDialogue/ExtendImage";
// import ChatWithAI from "../ui/ImageEditDialogue/ChatWithAI";
import { PinClickEvent } from "@/types";
import AddVariants from "../ui/AddVariants";

type ImagePinProps = {
  pinSize: string;
  imgSrc: string;
  name?: string;
  id: string;
  idx: number;
  checked?: boolean;
  getPage?: boolean;
  is_url?: string;
  onCheckboxChange?: () => void;
  onClick?: (event: PinClickEvent) => void;
  setIndex: (index: number) => void;
};

function ImagePin({
  pinSize,
  imgSrc,
  onCheckboxChange,
  setIndex,
  idx,
  checked,
  getPage,
  id,
  is_url,
}: ImagePinProps) {
  return (
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

      {!getPage ? (
        <div className="content" onClick={onCheckboxChange}>
          <div>Select</div>
          <Checkbox color="gray" size="3" checked={checked} />
        </div>
      ) : (
        <div
          className="content_1 absolute right-0 top-0 flex h-[50px] w-full cursor-auto items-center justify-end bg-transparent px-4"
          onClick={onCheckboxChange}
        >
          <Popover.Root>
            <Popover.Trigger>
              <Button
                variant="soft"
                className="cursor-pointer bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-25"
              >
                <Image
                  src={"/images/menu.png"}
                  alt={"menu"}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </Button>
            </Popover.Trigger>
            <Popover.Content className="p-0">
              {/* Add object start  */}
              {/* <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="soft"
                    className="w-full cursor-pointer p-2 text-black hover:bg-gray dark:text-white"
                  >
                    Add Object
                  </Button>
                </Dialog.Trigger>
                <AddObject
                  title="Add Object"
                  description="Please provide the image and select the area where you want to add the object from."
                  src={imgSrc}
                  id={id}
                  is_url={is_url}
                />
              </Dialog.Root> */}
              {/* Add object end  */}
              {/* <Separator className="w-full" /> */}
              {/* Remove object start  */}
              {/* <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="soft"
                    className="w-full cursor-pointer p-2 text-black hover:bg-gray dark:text-white"
                  >
                    Remove Object
                  </Button>
                </Dialog.Trigger>
                <RemoveObject
                  title="Remove Object"
                  description="Please provide the image and select the area where you want to remove the object from."
                  src={imgSrc}
                  id={id}
                  is_url={is_url}
                />
              </Dialog.Root> */}
              {/* Remove object end  */}
              {/* <Separator className="w-full" /> */}
              {/* Chat With AI start  */}
              {/* <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="soft"
                    className="w-full cursor-pointer p-2 text-black hover:bg-gray dark:text-white"
                  >
                    Chat With AI
                  </Button>
                </Dialog.Trigger>
                <ChatWithAI
                  title="Chat With AI"
                  description="Please provide the image and select the area where you want to remove the object from."
                  src={imgSrc}
                  id={id}
                  is_url={is_url}
                />
              </Dialog.Root> */}
              {/* Chat With AI end  */}
              {/* <Separator className="w-full" /> */}
              {/*  Fix Lighting start  */}
              {/* <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="soft"
                    className="w-full cursor-pointer p-2 text-black hover:bg-gray dark:text-white"
                  >
                    Fix Lighting
                  </Button>
                </Dialog.Trigger>
                <FixLight
                  title=" Fix Lighting"
                  description="Please Click the arrow key to apply AI to fix the light in the image."
                  src={imgSrc}
                  id={id}
                  is_url={is_url}
                />
              </Dialog.Root> */}
              {/*  Fix Lighting end  */}
              {/* <Separator className="w-full" /> */}
              {/*  Extend Image start  */}
              {/* <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="soft"
                    className="w-full cursor-pointer p-2 text-black hover:bg-gray dark:text-white"
                  >
                    Extend Image
                  </Button>
                </Dialog.Trigger>
                <ExtendImage
                  title=" Extend Image"
                  description="Please Click the arrow key to apply AI to extend the image to widescreen ratio."
                  src={imgSrc}
                  id={id}
                  is_url={is_url}
                />
              </Dialog.Root> */}
              {/*  Extend Image end  */}
              {/* <Separator className="w-full" /> */}
              {/*  Add Variants start  */}
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button
                    variant="soft"
                    className="w-full cursor-pointer p-2 text-black hover:bg-gray dark:text-white"
                  >
                    Add Variants
                  </Button>
                </Dialog.Trigger>
                <AddVariants
                  title=" Add Variants"
                  id={id}
                  description="Please upload the variant image and it's corresponding tag."
                />
              </Dialog.Root>
              {/*  Add Variants end  */}
            </Popover.Content>
          </Popover.Root>
        </div>
      )}
    </div>
  );
}

export default ImagePin;
