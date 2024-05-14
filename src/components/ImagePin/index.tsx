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
  onClick?: (event: PinClickEvent) => void;
  setIndex: (index: number) => void;
};

function ImagePin({ pinSize, imgSrc, name, setIndex, idx }: ImagePinProps) {
  return (
    <div className={`pin ${pinSize}`}>
      <img
        src={imgSrc}
        alt=""
        className="mainPic"
        onClick={(event) => setIndex(idx)}
      />

      <div className="content">
        <h3>{name ? name : "Content"}</h3>
      </div>
    </div>
  );
}

export default ImagePin;
