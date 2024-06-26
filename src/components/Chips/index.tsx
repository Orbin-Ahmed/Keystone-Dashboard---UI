import React from "react";

type ChipsProps = {
  value: string;
  onRemove: () => void;
};

const Chips = ({ value, onRemove }: ChipsProps) => {
  return (
    <div
      onClick={onRemove}
      className="font-sans relative grid cursor-pointer select-none items-center whitespace-nowrap rounded-lg bg-gray px-3 py-1.5 text-xs font-bold uppercase text-black"
    >
      <span>{value}</span>
    </div>
  );
};

export default Chips;
