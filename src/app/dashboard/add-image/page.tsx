"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tab from "@/components/Tab";
import SearchBar, { ImageObject } from "@/components/SearchBar";
import { useState } from "react";

type Props = {};

const AddImage = (props: Props) => {
  const [imagesSrc, setImagesSrc] = useState<ImageObject[]>([]);

  const handleSetImagesSrc = (images: ImageObject[]) => {
    setImagesSrc(images);
  };

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Dream Space" />
        <SearchBar handleSetImagesSrc={handleSetImagesSrc} />
        <div>
          <Tab />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddImage;
