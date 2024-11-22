import React from "react";
import CustomButton from "@/components/CustomButton";

interface AddItemSidebarProps {
  onToggleItems: () => void;
}

const AddItemSidebar: React.FC<AddItemSidebarProps> = ({ onToggleItems }) => {
  return (
    <CustomButton variant="tertiary" onClick={onToggleItems}>
      Add Items
    </CustomButton>
  );
};

export default AddItemSidebar;
