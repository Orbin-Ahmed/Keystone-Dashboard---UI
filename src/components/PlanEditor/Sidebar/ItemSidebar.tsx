import { SidebarItem } from "@/types";
import React, { useEffect, useState } from "react";

interface ItemSidebarProps {
  selectedPlane: string;
}

const ItemSidebar: React.FC<ItemSidebarProps> = ({ selectedPlane }) => {
  const [items, setItems] = useState<{ [category: string]: SidebarItem[] }>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/items/`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch items.");
      }
      const data = await response.json();

      const categorizedItems: { [category: string]: SidebarItem[] } = {};
      data.forEach((item: any) => {
        const category = item.category;
        if (!categorizedItems[category]) {
          categorizedItems[category] = [];
        }
        categorizedItems[category].push({
          name: item.item_name,
          imageSrc: `${process.env.NEXT_PUBLIC_API_MEDIA_URL + item.viewer2d}`,
          category: item.category,
          width: item.width,
          height: item.height,
          depth: item.depth,
          type: item.type,
        });
      });

      setItems(categorizedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDragStart = (
    event: React.DragEvent<HTMLImageElement>,
    item: SidebarItem,
  ) => {
    event.dataTransfer.setData("application/json", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "copy";
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div className="mt-4 w-1/2 overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-bold">Items</h3>
      <div className="flex flex-col gap-2">
        {Object.entries(items).map(([category, itemsInCategory]) => {
          const filteredItems = itemsInCategory.filter(
            (item) =>
              (selectedPlane === "floor" && item.type !== "Ceiling") ||
              (selectedPlane === "roof" && item.type === "Ceiling"),
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={category}>
              <button
                className="w-full rounded-lg px-3 text-left font-semibold"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>

              {expandedCategory === category && (
                <div className="bg-gray-100 mt-2 grid grid-cols-2 gap-4 rounded-lg p-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex cursor-pointer flex-col items-center text-center"
                    >
                      <img
                        src={item.imageSrc}
                        alt={item.name}
                        draggable={true}
                        onDragStart={(event) => handleDragStart(event, item)}
                        width={50}
                        height={50}
                      />
                      <span className="text-gray-700 mt-2 text-sm font-medium">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemSidebar;
