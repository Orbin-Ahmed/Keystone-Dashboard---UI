import { Tabs } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import NextLightbox from "../NextLightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import ImageBox from "../ImageBox";
import { ImageObject } from "@/types";
import ImagePin from "../ImagePin";

type TabContentsProps = {
  value: string;
  imagesSrc?: ImageObject[];
  setSelectedImage: (selected: string[]) => void;
};

const TabContents = ({
  value,
  imagesSrc,
  setSelectedImage,
}: TabContentsProps) => {
  const imagesWithValues: ImageObject[] = imagesSrc as ImageObject[];
  const [index, setIndex] = React.useState(-1);
  const [checkedState, setCheckedState] = useState<boolean[]>([]);

  useEffect(() => {
    if (imagesWithValues.length > 0) {
      setCheckedState(imagesWithValues.map(() => false));
    }
  }, [imagesWithValues]);

  const handleCheck = (idx: number) => {
    const newCheckedState = checkedState.map((checked, i) =>
      i === idx ? !checked : checked,
    );
    setCheckedState(newCheckedState);

    const selectedUrls = newCheckedState.reduce<string[]>(
      (urls, checked, i) => {
        if (checked) {
          urls.push(imagesWithValues[i].lightBoxUrl);
        }
        return urls;
      },
      [],
    );

    setSelectedImage(selectedUrls);
  };

  const lightboxUrlList = imagesWithValues.map((item) => ({
    src: item.lightBoxUrl,
    // download: `https://corsproxy.io/?${item.url}`,
    download: `${item.url}`,
  }));

  return (
    <>
      <Tabs.Content value={value} className="mt-6">
        {imagesWithValues?.length > 0 ? (
          //  <div className="grid h-80 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="mainContainer">
            {imagesWithValues.map((imgObject, i) => (
              <ImagePin
                pinSize="small"
                key={imgObject.id}
                imgSrc={imgObject.url}
                id={imgObject.id}
                idx={i}
                checked={checkedState[i]}
                onCheckboxChange={() => handleCheck(i)}
                setIndex={setIndex}
              />
            ))}
          </div>
        ) : (
          <ImageBox />
        )}
      </Tabs.Content>
      <Lightbox
        index={index}
        slides={lightboxUrlList}
        open={index >= 0}
        close={() => setIndex(-1)}
        render={{ slide: NextLightbox }}
        plugins={[Download]}
      />
    </>
  );
};

export default TabContents;
