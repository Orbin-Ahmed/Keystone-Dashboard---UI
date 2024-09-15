"use client";

import dynamic from "next/dynamic";

const DynamicReactPlanner = dynamic(() => import("./wrapper"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const FloorPlanner = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <DynamicReactPlanner />
    </div>
  );
};

export default FloorPlanner;
