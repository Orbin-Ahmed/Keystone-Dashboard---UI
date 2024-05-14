import React from "react";

type ImagePinProps = {
  pinSize: string;
  imgSrc: string;
  name?: string;
  id: string;
};

function ImagePin({ pinSize, imgSrc, name, id }: ImagePinProps) {
  return (
    <div className={`pin ${pinSize}`}>
      <img src={imgSrc} alt="" className="mainPic" />

      <div className="content">
        <h3>{name ? name : "Content"}</h3>
      </div>
    </div>
  );
}

export default ImagePin;
