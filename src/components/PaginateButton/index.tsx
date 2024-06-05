import React, { useEffect } from "react";
import CustomButton from "../CustomButton";

type PaginationProps = {
  total: number;
  currentPage: number;
  setCurrentPage: (val: number) => void;
  offset: number;
  setOffset: (val: number) => void;
};

const PaginateButton = ({
  total,
  currentPage,
  setCurrentPage,
  offset,
  setOffset,
}: PaginationProps) => {
  const pageSize = 30;

  const handleNext = () => {
    if (offset + pageSize < total) {
      setOffset(offset + pageSize);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setOffset(offset - pageSize);
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (keyCode === 37) {
        handlePrev();
      } else if (keyCode === 39) {
        handleNext();
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [currentPage, total]);

  return (
    <div className="flex flex-col items-center">
      <div className="xs:mt-0 mt-2 inline-flex items-center">
        <CustomButton
          variant="tertiary"
          className="flex items-center"
          onClick={handlePrev}
          disabled={currentPage === 1}
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
          disabled={currentPage * 30 >= total}
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
  );
};

export default PaginateButton;
