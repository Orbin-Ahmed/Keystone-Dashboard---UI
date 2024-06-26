import React, { useEffect } from "react";
import CustomButton from "../CustomButton";

type PaginationProps = {
  total: number;
  currentPage: number;
  setCurrentPage: (val: number) => void;
  showingNumberFrom: number;
  setShowingNumberFrom: (val: number) => void;
  showingNumberTo: number;
  setShowingNumberTo: (val: number) => void;
};

const Pagination = ({
  total,
  currentPage,
  setCurrentPage,
  showingNumberFrom,
  setShowingNumberFrom,
  showingNumberTo,
  setShowingNumberTo,
}: PaginationProps) => {
  const handleNext = () => {
    const newShowingNumberFrom = showingNumberFrom + 20;
    const newShowingNumberTo = Math.min(showingNumberTo + 20, total);

    setShowingNumberFrom(newShowingNumberFrom);
    setShowingNumberTo(newShowingNumberTo);
    if (currentPage * 20 < total) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    const newShowingNumberFrom = Math.max(showingNumberFrom - 20, 1);
    const newShowingNumberTo = newShowingNumberFrom + 19;

    setShowingNumberFrom(newShowingNumberFrom);
    setShowingNumberTo(newShowingNumberTo);
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (total > 1 && keyCode === 37) {
        handlePrev();
      } else if (total > 1 && keyCode === 39) {
        handleNext();
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
      <div className="flex flex-col items-center">
        <span className="text-gray-700 dark:text-gray-400 text-sm">
          Showing{" "}
          <span className="text-gray-900 font-semibold dark:text-white">
            {showingNumberFrom}
          </span>{" "}
          to{" "}
          <span className="text-gray-900 font-semibold dark:text-white">
            {showingNumberTo}
          </span>{" "}
          of{" "}
          <span className="text-gray-900 font-semibold dark:text-white">
            {total}
          </span>{" "}
          Images
        </span>
        <div className="xs:mt-0 mt-2 inline-flex items-center">
          <CustomButton
            variant="tertiary"
            className="flex items-center"
            onClick={handlePrev}
            disabled={showingNumberFrom === 1}
          >
            <svg
              className="me-2 h-3.5 w-3.5 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5H1m0 0 4 4M1 5l4-4"
              />
            </svg>
            Prev
          </CustomButton>
          <p className="mx-4 rounded-md border border-gray p-2.5 shadow-2">
            {currentPage}
          </p>
          <CustomButton
            variant="tertiary"
            className="flex items-center"
            onClick={handleNext}
            disabled={showingNumberTo >= total}
          >
            Next
            <svg
              className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default Pagination;
