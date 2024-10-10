import Image from "next/image";
import { TbArrowUpRight } from "react-icons/tb";
import CustomButton from "../CustomButton";

export default function HeroSection() {
  return (
    <div className="bg-zinc-50">
      <div className="container py-8 text-center lg:flex lg:justify-between lg:py-0 lg:text-left ">
        <div className="lg:w-1/2 lg:py-8 xl:py-14">
          <p className="tracking-widest">OFFER FOR THE BEST INTERIOR</p>
          <h1 className="text-gray-800 py-4 text-3xl font-extrabold leading-tight lg:text-4xl xl:text-6xl">
            An aesthetic room is <br />
            given harmony
          </h1>
          <p className="text-gray-500 pb-6 xl:pb-10">
            Change your view with the best interior design. <br /> We provide
            the best interior design for your Home. <br />
            Make every moment beautiful with the best interior design.
          </p>
          <a href="/view/about">
            <CustomButton
              variant="primary"
              className="inline-flex items-center rounded-full px-8 py-3"
            >
              Get Started
              <TbArrowUpRight className="ml-2 h-5 w-5" />
            </CustomButton>
          </a>
        </div>

        <div className="w-1/2">
          <Image
            src="/images/view/(3).jpg"
            width={800}
            height={500}
            alt=""
            className="absolute right-0 hidden rounded-l-xl lg:block lg:h-[344px]  lg:w-[500px] xl:h-[448px] xl:w-[700px]"
          />
        </div>
      </div>
    </div>
  );
}
