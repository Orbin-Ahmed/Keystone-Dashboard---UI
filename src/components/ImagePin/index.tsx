"use client";
import {
  Button,
  Checkbox,
  DropdownMenu,
  Popover,
  Separator,
} from "@radix-ui/themes";
import Image from "next/image";
import React from "react";

interface PinClickEvent {
  index: number;
}

type ImagePinProps = {
  pinSize: string;
  imgSrc: string;
  name?: string;
  id?: string;
  idx: number;
  checked?: boolean;
  getPage?: boolean;
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
}: ImagePinProps) {
  return (
    <div className={`pin ${pinSize}`}>
      <img
        src={imgSrc}
        alt=""
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
            <Popover.Content size="1" maxWidth="300px" className="p-0">
              <p className="cursor-pointer p-2 hover:bg-gray">Add Object</p>
              <Separator className="w-full" />
              <p className="cursor-pointer p-2 hover:bg-gray">Remove Object</p>
              <Separator className="w-full" />
              <p className="cursor-pointer p-2 hover:bg-gray">Chat With AI</p>
              <Separator className="w-full" />
              <p className="cursor-pointer p-2 hover:bg-gray">Light Fix</p>
              <Separator className="w-full" />
              <p className="cursor-pointer p-2 hover:bg-gray">Extend Image</p>
            </Popover.Content>
          </Popover.Root>
        </div>
      )}
    </div>
  );
}

export default ImagePin;
