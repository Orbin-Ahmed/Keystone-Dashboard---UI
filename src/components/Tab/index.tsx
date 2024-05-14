import { Tabs } from "@radix-ui/themes";
import React from "react";
import TabContents from "../TabContent";
import Image from "next/image";
import { ImageObject } from "../SearchBar";

type TabListProps = {
  id: number;
  value: string;
  logo: string;
  api: string;
};

type TabProps = {
  imagesSrc: ImageObject[];
  handleSourceChange: (val: string) => void;
};

const tabList: TabListProps[] = [
  {
    id: 1,
    value: "Pinterest",
    logo: "/images/brand/pinterest.png",
    api: "",
  },
  {
    id: 2,
    value: "Unsplash",
    logo: "/images/brand/unsplash.png",
    api: "",
  },
  {
    id: 3,
    value: "Pexels",
    logo: "/images/brand/pexels.png",
    api: "",
  },
  {
    id: 4,
    value: "Pixabay",
    logo: "/images/brand/pixabay.svg",
    api: "",
  },
];

const Tab = ({ imagesSrc, handleSourceChange }: TabProps) => {
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
          {tabList.map((element) => (
            <TabContents
              key={element.id}
              value={element.value}
              imagesSrc={imagesSrc}
            />
          ))}
        </div>
      </Tabs.Root>
    </>
  );
};

export default Tab;
