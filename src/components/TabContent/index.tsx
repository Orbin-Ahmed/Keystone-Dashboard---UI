import { Tabs } from "@radix-ui/themes";
import React from "react";
import Pin from "../ImagePin";
import { ImageObject } from "../SearchBar";

type TabContentsProps = {
  value: string;
  imagesSrc?: ImageObject[];
};

const TabContents = ({ value, imagesSrc }: TabContentsProps) => {
  const imagesWithValues: ImageObject[] = imagesSrc as ImageObject[];

  return (
    <>
      <Tabs.Content value={value} className="mt-6">
        <div className="mainContainer">
          {imagesWithValues.map((imgObject) => (
            <Pin
              pinSize="small"
              key={imgObject.id}
              imgSrc={imgObject.url}
              id={imgObject.id}
            />
          ))}
        </div>
      </Tabs.Content>
    </>
  );
};

export default TabContents;
