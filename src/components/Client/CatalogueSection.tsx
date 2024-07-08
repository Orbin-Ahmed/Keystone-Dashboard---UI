"use client";
import Image from "next/image";
import { TbArrowNarrowRight } from "react-icons/tb";

export default function CatalogueSection() {
  const items = [
    {
      id: "01",
      catagory: "BEDROOM SETUP",
      title: "Cossy Bedroom Setup",
      image: "/images/client_interface/badroom.jpg",
      description:
        "family bed room with a clean and comfortable design for your family.",
    },
    {
      id: "02",
      catagory: "KITCHING SETUP",
      title: "Neat & Clean Kitchen",
      image: "/images/client_interface/kitchen1.jpg",
      description:
        "kitchen with a clean and comfortable design for your family.",
    },
    {
      id: "03",
      catagory: "DRAWING SETUP",
      title: "Family Drawing Room",
      image: "/images/client_interface/drowing.jpg",
      description:
        "family drawing room with a clean and comfortable design for your family.",
    },
    {
      id: "04",
      catagory: "LIVING SETUP",
      title: "Clean Family Room",
      image: "/images/client_interface/living.jpg",
      description:
        "family living room with a clean and comfortable design for your family.",
    },
  ];

  return (
    <div className="divide-gray-300 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x">
      {items.map((item) => (
        <div key={item.id} className="group relative overflow-hidden">
          <div>
            <Image
              src={item.image}
              width={380}
              height={100}
              alt=""
              className="w-full "
            />
          </div>
          <div className="absolute top-0 m-12 bg-white bg-opacity-60 p-8 backdrop-blur">
            <div className="flex justify-between pb-4 ">
              <p className="text-sm">{item.catagory}</p>
              <span className="text-sm ">{item.id}</span>
            </div>
            <a className="block text-xl font-semibold" href="">
              {item.title}
            </a>
            <p className="text-gray-500 py-4">{item.description}</p>
            <a className="inline-flex items-center font-medium" href="">
              See Details <TbArrowNarrowRight className="ml-2 text-xl " />
            </a>
          </div>

          <div className="inset-0 hidden flex-col items-center justify-end gap-32 border-b-2 bg-zinc-100 pb-16 text-xl transition duration-300 ease-in-out group-hover:translate-y-full md:absolute md:flex md:border-b-0">
            <p className="-rotate-90 tracking-wider ">{item.catagory} </p>
            <span className="">{item.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
