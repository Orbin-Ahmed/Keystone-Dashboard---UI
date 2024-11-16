import React, { useState } from "react";

const ItemSidebar: React.FC<{
  categories: {
    name: string;
    items: { name: string; path: string; type: string }[];
  }[];
  onItemClick: (item: any) => void;
}> = ({ categories, onItemClick }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory((prev) =>
      prev === categoryName ? null : categoryName,
    );
  };

  return (
    <div
      className="mt-4 h-[80vh] w-80 overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1" }}
    >
      <h3 className="text-lg font-bold">Items</h3>
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <div key={category.name}>
            {/* Accordion Header */}
            <button
              className="bg-gray-200 w-full rounded-lg px-3 py-2 text-left font-semibold"
              onClick={() => toggleCategory(category.name)}
            >
              {category.name}
            </button>

            {/* Accordion Content */}
            {expandedCategory === category.name && (
              <div className="bg-gray-100 mt-2 grid grid-cols-2 gap-4 rounded-lg p-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex cursor-pointer flex-col items-center text-center"
                    onClick={() => onItemClick(item)}
                  >
                    <img
                      src={`/models/items/${item.type}.png`}
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
