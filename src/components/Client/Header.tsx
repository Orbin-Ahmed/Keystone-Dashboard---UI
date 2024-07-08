import Image from "next/image";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <div className="sticky inset-x-0 top-0 z-10 bg-zinc-100 bg-opacity-60 backdrop-blur-lg">
      <div className="container flex items-center justify-between py-6 ">
        <div className="flex items-center gap-4">
          <Image
            src="/images/logo/logo.png"
            alt="logo"
            width={60}
            height={24}
            className="object-contain"
          />{" "}
          <p className="font-bold italic">Ideal Home Interior</p>
        </div>
        <Navigation />
      </div>
    </div>
  );
}
