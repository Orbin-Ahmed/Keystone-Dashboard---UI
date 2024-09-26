import React from "react";
import dynamic from "next/dynamic";

const PlanEditor = dynamic(() => import("@/components/PlanEditor"), {
  ssr: false,
});

type FloorPlannerProps = {};

const FloorPlanner = ({}: FloorPlannerProps) => {
  return (
    <>
      <PlanEditor />
    </>
  );
};

export default FloorPlanner;
