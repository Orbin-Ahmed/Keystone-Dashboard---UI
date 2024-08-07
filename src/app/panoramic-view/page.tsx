"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PanoramicViewer from "@/components/PanoViewer";

const PanoramicViewPage = () => {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {imageUrl ? <PanoramicViewer imageSrc={imageUrl} /> : <p>Loading...</p>}
    </div>
  );
};

export default PanoramicViewPage;
