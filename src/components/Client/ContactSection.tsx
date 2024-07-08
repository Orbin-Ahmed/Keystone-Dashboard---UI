import { TbArrowUpRight } from "react-icons/tb";
import CustomButton from "../CustomButton";

export default function ContactSection() {
  return (
    <div className="bg-zinc-100">
      <div className="container items-center border-b-2 py-14 text-center lg:flex lg:justify-between">
        <div className="py-4">
          <p className="text-2xl">Lets</p>
          <h1 className="text-3xl font-medium lg:text-6xl">Get in touch</h1>
        </div>
        <a href="/view/about">
          <CustomButton
            variant="primary"
            className="inline-flex items-center gap-1 rounded-full px-6 py-3 text-sm"
          >
            Contact Us <TbArrowUpRight className="text-xl" />{" "}
          </CustomButton>
        </a>
      </div>
    </div>
  );
}
