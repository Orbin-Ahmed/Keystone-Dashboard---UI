"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getAllImageCount } from "@/api";
import { ApiResponse, BrandData } from "@/types";

const brandLogos: { [key: string]: string } = {
  Designer: "/images/brand/designer.png",
  Pinterest: "/images/brand/pinterest.png",
  Unsplash: "/images/brand/unsplash.png",
  Pixabay: "/images/brand/pixabay.svg",
  Pexels: "/images/brand/pexels.png",
};

type SourceTableProps = {
  setCount: (value: string) => void;
};

const SourceTable = ({ setCount }: SourceTableProps) => {
  const [brandData, setBrandData] = useState<BrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data: ApiResponse = await getAllImageCount();
        setCount(String(data.count));
        const targeImage = 100;
        const formattedData: BrandData[] = data.values.map((item) => ({
          logo: brandLogos[item.source] || "/images/brand/default.png",
          name: item.source,
          category: item.room_type || "Unknown",
          target_images: targeImage,
          current_images: item.count,
          percentage: (item.count / targeImage) * 100,
        }));
        setBrandData(formattedData);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top Category
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Source
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Category
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Target Images
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Current Images
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Percentage
            </h5>
          </div>
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === brandData.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <Image src={brand.logo} alt="Brand" width={48} height={48} />
              </div>
              <p className="hidden text-black dark:text-white sm:block">
                {brand.name}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.category}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{brand.target_images}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">
                {brand.current_images}
              </p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-meta-5">{brand.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceTable;
