import React from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";

type PanoramicViewerProps = {
  imageSrc: string;
};

const PanoramicViewer = ({ imageSrc }: PanoramicViewerProps) => {
  const plugins = [
    [
      AutorotatePlugin,
      {
        autorotateSpeed: "1rpm",
        autorotatePitch: "5deg",
      },
    ],
  ] as [any, any][];

  return (
    <ReactPhotoSphereViewer
      src={imageSrc}
      height="100%"
      width="100%"
      plugins={plugins}
    />
  );
};

export default PanoramicViewer;
