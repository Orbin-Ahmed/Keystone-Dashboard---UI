import React from "react";

type ImagePinProps = {
  pinSize: string;
  imgSrc: string;
  name: string;
};

function Pin({ pinSize, imgSrc, name }: ImagePinProps) {
  return (
    <div className={`pin ${pinSize}`}>
      <img src={imgSrc} alt="" className="mainPic" />

      <div className="content">
        <h3>{name}</h3>
      </div>
    </div>
  );
}

export default Pin;
