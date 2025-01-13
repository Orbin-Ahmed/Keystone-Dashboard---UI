import React, { useState, useEffect } from "react";

interface SidebarItem {
  name: string;
  path: string;
  typeM: string;
  viewer3d: string;
  width: number;
  height: number;
  depth: number;
  type: string;
}

interface ItemCategory {
  name: string;
  items: SidebarItem[];
}

interface ItemSidebarProps {
  onItemClick: (item: SidebarItem) => void;
}

const ItemSidebar: React.FC<ItemSidebarProps> = ({ onItemClick }) => {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch items.");
      }
      const data = await response.json();
      const categorizedItems: ItemCategory[] = [];
      const categoryMap: { [key: string]: SidebarItem[] } = {};

      data.forEach((item: any) => {
        const category = item.category;
        if (!categoryMap[category]) {
          categoryMap[category] = [];
        }

        categoryMap[category].push({
          name: item.item_name,
          path: `${process.env.NEXT_PUBLIC_API_MEDIA_URL}${item.glb_file}`,
          typeM: item.item_name.toLowerCase().replace(/[-\s]/g, "_"),
          viewer3d: `${process.env.NEXT_PUBLIC_API_MEDIA_URL}${item.viewer3d}`,
          width: item.width,
          height: item.height,
          depth: item.depth,
          type: item.type,
        });
      });

      for (const [categoryName, items] of Object.entries(categoryMap)) {
        categorizedItems.push({ name: categoryName, items });
      }

      setCategories(categorizedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory((prev) =>
      prev === categoryName ? null : categoryName,
    );
  };

  return (
    <div
      className="mt-4 h-[70vh] w-80 overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1" }}
    >
      <h3 className="text-lg font-bold">Items</h3>
      <div className="flex flex-col gap-2">
        {categories
          .filter((category) =>
            // Include the category only if it has items other than "Ceiling" or "Wall"
            category.items.some(
              (item) => item.type !== "Ceiling" && item.type !== "Wall",
            ),
          )
          .map((category) => (
            <div key={category.name}>
              <button
                className="bg-gray-200 w-full rounded-lg px-3 py-2 text-left font-semibold"
                onClick={() => toggleCategory(category.name)}
              >
                {category.name}
              </button>

              {expandedCategory === category.name && (
                <div className="bg-gray-100 mt-2 grid grid-cols-2 gap-4 rounded-lg p-3">
                  {category.items
                    .filter(
                      (item) => item.type !== "Ceiling" && item.type !== "Wall",
                    )
                    .map((item) => (
                      <div
                        key={item.name}
                        className="flex cursor-pointer flex-col items-center text-center"
                        onClick={() => onItemClick(item)}
                      >
                        <img
                          src={item.viewer3d}
                          alt={item.name}
                          className="h-24 w-24 object-contain"
                        />
                        <span className="text-gray-700 mt-2 text-sm font-medium">
                          {item.name}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ItemSidebar;
