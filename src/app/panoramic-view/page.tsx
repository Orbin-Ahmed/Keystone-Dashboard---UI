"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PanoramicViewer from "@/components/PanoViewer";

const PanoramicViewPage = () => {
  const searchParams = useSearchParams();
  const imageData = searchParams.get("imageData");

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {imageData ? <PanoramicViewer imageSrc={imageData} /> : <p>Loading...</p>}
    </div>
  );
};

export default PanoramicViewPage;
