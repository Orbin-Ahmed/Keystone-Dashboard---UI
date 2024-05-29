import { Skeleton } from "@radix-ui/themes";
import React from "react";

const ImageBox = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <Skeleton className="bg-gray-200 h-80 w-full animate-pulse rounded-lg" />
      <Skeleton className="bg-gray-200 h-80 w-full animate-pulse rounded-lg" />
      <Skeleton className="bg-gray-200 h-80 w-full animate-pulse rounded-lg" />
      <Skeleton className="bg-gray-200 h-80 w-full animate-pulse rounded-lg" />
      <Skeleton className="bg-gray-200 h-80 w-full animate-pulse rounded-lg" />
      <Skeleton className="bg-gray-200 h-80 w-full animate-pulse rounded-lg" />
    </div>
  );
};

export default ImageBox;
