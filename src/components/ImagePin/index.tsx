"use client";
import { Checkbox } from "@radix-ui/themes";
import React from "react";

interface PinClickEvent {
  index: number;
}

type ImagePinProps = {
  pinSize: string;
  imgSrc: string;
  name?: string;
  id: string;
  idx: number;
  checked: boolean;
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
}: ImagePinProps) {
  return (
    <div className={`pin ${pinSize}`}>
      <img
        src={imgSrc}
        alt=""
        className="mainPic"
        onClick={() => setIndex(idx)}
      />

      <div className="content" onClick={onCheckboxChange}>
        <div>Select</div>
        <Checkbox color="gray" size="3" checked={checked} />
      </div>
    </div>
  );
}

export default ImagePin;
