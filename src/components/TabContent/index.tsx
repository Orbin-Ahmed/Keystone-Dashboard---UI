import { Tabs } from "@radix-ui/themes";
import React from "react";
import Pin from "../ImagePin";
import { ImageObject } from "../SearchBar";
import IndexBox from "../ImageBox";

type TabContentsProps = {
  value: string;
  imagesSrc?: ImageObject[];
};

const TabContents = ({ value, imagesSrc }: TabContentsProps) => {
  const imagesWithValues: ImageObject[] = imagesSrc as ImageObject[];

  return (
    <>
      <Tabs.Content value={value} className="mt-6">
        {imagesWithValues?.length > 0 ? (
          <div className="grid h-80 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {imagesWithValues.map((imgObject) => (
              <Pin
                pinSize="small"
                key={imgObject.id}
                imgSrc={imgObject.url}
                id={imgObject.id}
              />
            ))}
          </div>
        ) : (
          <IndexBox />
        )}
      </Tabs.Content>
    </>
  );
};

export default TabContents;
