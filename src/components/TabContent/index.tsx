import { Tabs } from "@radix-ui/themes";
import React from "react";
import ImagePin from "../ImagePin";
import { ImageObject } from "../SearchBar";
import IndexBox from "../ImageBox";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import NextLightbox from "../NextLightbox";

type TabContentsProps = {
  value: string;
  imagesSrc?: ImageObject[];
};

const TabContents = ({ value, imagesSrc }: TabContentsProps) => {
  const imagesWithValues: ImageObject[] = imagesSrc as ImageObject[];
  const [index, setIndex] = React.useState(-1);
  const lightboxUrlList = imagesWithValues.map((item) => ({
    src: item.lightBoxUrl,
  }));
  console.log(imagesWithValues);
  return (
    <>
      <Tabs.Content value={value} className="mt-6">
        {imagesWithValues?.length > 0 ? (
          //  <div className="grid h-80 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"></div>
          <div className="mainContainer">
            {imagesWithValues.map((imgObject, i) => (
              <ImagePin
                pinSize="small"
                key={imgObject.id}
                imgSrc={imgObject.url}
                id={imgObject.id}
                idx={i}
                setIndex={setIndex}
              />
            ))}
          </div>
        ) : (
          <IndexBox />
        )}
      </Tabs.Content>
      <Lightbox
        index={index}
        slides={lightboxUrlList}
        open={index >= 0}
        close={() => setIndex(-1)}
        render={{ slide: NextLightbox }}
      />
    </>
  );
};

export default TabContents;
