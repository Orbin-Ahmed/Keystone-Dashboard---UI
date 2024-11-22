import React from "react";
import CustomButton from "@/components/CustomButton";
import { TourPoint } from "@/types";

interface TourPointsListProps {
  tourPoints: TourPoint[];
  activeTourPoint: TourPoint | null;
  onTourPointClick: (point: TourPoint) => void;
  onExitTour: () => void;
}

const TourPointsList: React.FC<TourPointsListProps> = ({
  tourPoints,
  activeTourPoint,
  onTourPointClick,
  onExitTour,
}) => {
  return (
    <div className="mt-4 rounded-lg bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-2">
        {tourPoints.map((point) => (
          <CustomButton
            key={point.id}
            variant={
              activeTourPoint?.id === point.id ? "secondary" : "tertiary"
            }
            onClick={() => onTourPointClick(point)}
          >
            {point.title}
          </CustomButton>
        ))}
        {activeTourPoint && (
          <CustomButton variant="tertiary" onClick={onExitTour}>
            Exit Tour
          </CustomButton>
        )}
      </div>
    </div>
  );
};

export default TourPointsList;
