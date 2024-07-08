import Image from "next/image";

export default function AboutComponent() {
  return (
    <div className="container py-16">
      <div className="flex items-center justify-between pb-4">
        <a
          className="text-gray-800 py-4 text-3xl font-extrabold leading-tight lg:text-5xl"
          href=""
        >
          An aesthetic room is <br />
          given harmony
        </a>
        <p className="text-gray-400 tracking-wider">WORLD AWARD</p>
      </div>
      <div className="grid place-items-center lg:grid-cols-2 ">
        <div>
          <Image
            src="/images/client_interface/aboutfront.png"
            width={900}
            height={500}
            alt=""
            className="max-md:hidden"
          />
        </div>

        <div className="items-center">
          <p className="px-12 pb-4 ">
            Ideal Home is a company engaged in the field of interior design &
            wooden joinery products. We provide the best interior design for
            your home. We have been trusted by many people to design their
            homes. We have also received many awards from various place for our
            work.
          </p>
          <div className="flex gap-x-4 px-12 pt-4 ">
            <Image
              src="/images/client_interface/awards.png"
              width={100}
              height={80}
              alt=""
              className=" h-[100px]"
            />
            <Image
              src="/images/client_interface/awards1.png"
              width={100}
              height={80}
              alt=""
              className=" h-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
