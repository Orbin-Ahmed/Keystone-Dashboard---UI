import { BRAND } from "@/types";
import Image from "next/image";

const brandData: BRAND[] = [
  {
    logo: "/images/brand/pexels.png",
    name: "Pexels",
    category: "Living Room",
    target_images: 5768,
    current_images: 580,
    percentage: 4.8,
  },
  {
    logo: "/images/brand/pinterest.png",
    name: "Pinterest",
    category: "Kitchen",
    target_images: 4635,
    current_images: 267,
    percentage: 4.3,
  },
  {
    logo: "/images/brand/unsplash.png",
    name: "Unsplash",
    category: "Bed Room",
    target_images: 4290,
    current_images: 900,
    percentage: 3.7,
  },
  {
    logo: "/images/brand/pinterest.png",
    name: "Pinterest",
    category: "Living Room",
    target_images: 2500,
    current_images: 500,
    percentage: 20,
  },
  {
    logo: "/images/brand/pixabay.svg",
    name: "Pixabay",
    category: "Kids Room",
    target_images: 2000,
    current_images: 645,
    percentage: 35,
  },
];

const SourceTable = () => {
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
