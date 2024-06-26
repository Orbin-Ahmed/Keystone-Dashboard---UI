import { Tabs } from "@radix-ui/themes";
import React from "react";
import TabContents from "../TabContent";
import Image from "next/image";
import { ImageObject, TabListProps } from "@/types";

type TabProps = {
  setSelectedImage: (selected: string[]) => void;
  pinterestImagesSrc: ImageObject[];
  unsplashImagesSrc: ImageObject[];
  pexelsImagesSrc: ImageObject[];
  pixabayImagesSrc: ImageObject[];
  houzzImageSrc: ImageObject[];
  imageSource: string;
  handleSourceChange: (val: string) => void;
};

const tabList: TabListProps[] = [
  {
    id: 1,
    value: "Pinterest",
    logo: "/images/brand/pinterest.png",
  },
  {
    id: 2,
    value: "Houzz",
    logo: "/images/brand/houzz.png",
  },
  {
    id: 3,
    value: "Unsplash",
    logo: "/images/brand/unsplash.png",
  },
  {
    id: 4,
    value: "Pexels",
    logo: "/images/brand/pexels.png",
  },
  {
    id: 5,
    value: "Pixabay",
    logo: "/images/brand/pixabay.svg",
  },
];

const Tab = ({
  setSelectedImage,
  pinterestImagesSrc,
  unsplashImagesSrc,
  pexelsImagesSrc,
  pixabayImagesSrc,
  imageSource,
  houzzImageSrc,
  handleSourceChange,
}: TabProps) => {
  const getImageSrc = () => {
    switch (imageSource) {
      case "Pinterest":
        return pinterestImagesSrc;
      case "Unsplash":
        return unsplashImagesSrc;
      case "Pexels":
        return pexelsImagesSrc;
      case "Pixabay":
        return pixabayImagesSrc;
      case "Houzz":
        return houzzImageSrc;
      default:
        return unsplashImagesSrc;
    }
  };

  const imagesSrc = getImageSrc();

  return (
    <>
      <Tabs.Root defaultValue="Pinterest">
        <Tabs.List justify="center" color="gray" highContrast>
          {tabList.map((element) => (
            <Tabs.Trigger
              key={element.id}
              value={element.value}
              onClick={() => handleSourceChange(element.value)}
            >
              <Image
                src={element.logo}
                alt={`${element.value} Logo`}
                width={24}
                height={24}
                className="mr-2 object-contain"
              />
              <span>{element.value}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div>
          {/* {tabList.map((element) => (
            <TabContents
              key={element.id}
              value={element.value}
              imagesSrc={imagesSrc}
            />
          ))} */}
          <TabContents
            value={imageSource}
            imagesSrc={imagesSrc}
            setSelectedImage={setSelectedImage}
          />
        </div>
      </Tabs.Root>
    </>
  );
};

export default Tab;
