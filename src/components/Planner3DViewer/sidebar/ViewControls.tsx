import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";

export type ViewType = "Top" | "Side" | "Default";

interface ViewDropdownProps {
  currentView: ViewType;
  onSelect: (view: ViewType) => void;
}

const ViewDropdown: React.FC<ViewDropdownProps> = ({
  currentView,
  onSelect,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 transform"
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <CustomButton
        variant="secondary"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {currentView} View
      </CustomButton>
      <div
        className={`absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2 transform gap-4 transition-all duration-300 ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className="flex h-12 w-16 transform cursor-pointer items-center justify-center rounded-full border bg-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-100"
          onClick={() => onSelect("Top")}
        >
          <span className="text-sm font-medium">Top</span>
        </div>
        <div
          className="flex h-12 w-16 transform cursor-pointer items-center justify-center rounded-full border bg-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-100"
          onClick={() => onSelect("Default")}
        >
          <span className="text-sm font-medium">Default</span>
        </div>
        <div
          className="flex h-12 w-16 transform cursor-pointer items-center justify-center rounded-full border bg-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-100"
          onClick={() => onSelect("Side")}
        >
          <span className="text-sm font-medium">Side</span>
        </div>
      </div>
    </div>
  );
};

export default ViewDropdown;
