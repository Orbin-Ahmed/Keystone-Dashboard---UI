import { SidebarItem } from "@/types";
import React, { useState } from "react";

interface ItemSidebarProps {}

const ItemSidebar: React.FC<ItemSidebarProps> = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleDragStart = (
    event: React.DragEvent<HTMLImageElement>,
    item: SidebarItem,
  ) => {
    event.dataTransfer.setData("application/json", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "copy";
  };

  const items: { [category: string]: SidebarItem[] } = {
    "Living Room": [
      {
        name: "Sofa",
        imageSrc: "/2DViewerAssets/sofaDouble.svg",
        category: "sofa",
        width: 150,
        height: 80,
      },
      {
        name: "TV",
        imageSrc: "/2DViewerAssets/tv.svg",
        category: "tv",
        width: 100,
        height: 70,
      },
    ],
    Kitchen: [
      {
        name: "Fridge",
        imageSrc: "/2DViewerAssets/kitchenFridge.svg",
        category: "fridge",
        width: 80,
        height: 180,
      },
      {
        name: "Stove",
        imageSrc: "/2DViewerAssets/stove.svg",
        category: "stove",
        width: 60,
        height: 60,
      },
    ],
  };

  const handleCategoryClick = (category: string) => {
    setExpandedCategory((prevCategory) =>
      prevCategory === category ? null : category,
    );
  };

  return (
    <div className="item-sidebar">
      {Object.entries(items).map(([category, itemsInCategory]) => (
        <div key={category}>
          <h3
            onClick={() => handleCategoryClick(category)}
            style={{ cursor: "pointer" }}
          >
            {category}
          </h3>
          {expandedCategory === category && (
            <div className="item-list">
              {itemsInCategory.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "inline-block",
                    width: "50%",
                    boxSizing: "border-box",
                    padding: "5px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    draggable={true}
                    onDragStart={(event) => handleDragStart(event, item)}
                    width={50}
                    height={50}
                  />
                  <div>{item.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ItemSidebar;
