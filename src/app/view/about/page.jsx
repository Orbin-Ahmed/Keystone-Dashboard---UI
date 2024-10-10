import CustomButton from "@/components/CustomButton";
import Image from "next/image";
import { TbArrowUpRight } from "react-icons/tb";
export default function About() {
  return (
    <div>
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/images/view/(2).jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        <div className="container relative py-64 text-6xl font-semibold tracking-widest text-white">
          WHO ARE WE?
        </div>
      </div>
      <div className="container ">
        <div className="py-4 lg:py-14">
          <h2 className="p-4 text-center text-3xl font-semibold lg:p-20 lg:text-5xl">
            We have great idea in Interior Design
          </h2>
          <p className="text-2xl font-medium lg:w-1/2">
            The Ideal Home design company is a company that provides interior
            design services for villas, offices, apartments, and others. We
            provide the best interior design services for you. We have a team
            that is experienced in the field of interior.
          </p>
        </div>
        <div className="mb-16 items-center gap-x-8 lg:flex">
          <div className="w-full">
            <Image
              src="/images/view/(1).jpg"
              width={700}
              height={700}
              alt=""
              className=""
            />
          </div>
          <div>
            <p className="pb-8 tracking-wide">
              We are Ideal Home, an UAE based company specializing in interior
              design, wooden joinery products, and architectural solutions. We
              believe that today it is fundamental to totally rethink
              architectural education. Confluence not only integrates new
              visions on society but also incorporates new methods and
              contemporary tools linked to creativity, production, and
              communication. Designed and handcrafted to hold and showcase our
              work, the unfolding box allows portfolio sheets...
              <br />
              <br />
              At Ideal Home, we believe that rethinking architectural education
              is essential. Confluence not only integrates new societal visions
              but also incorporates new methods and contemporary tools linked to
              creativity, production, and communication.
              <br />
              <br />
              <span className="text-xl font-extrabold tracking-tight">
                At Ideal Home Interior, we share a belief in the
                transformational power of people united in a common purpose.
              </span>
            </p>
            <a href="/">
              <CustomButton className="inline-flex items-center gap-1 rounded-full px-6 py-3 text-sm">
                Read More <TbArrowUpRight className="text-xl" />{" "}
              </CustomButton>
            </a>
          </div>
        </div>
        {/* <div className="lg:py-20">
          <div className="pb-4 pt-8">
            <h1 className="text-center text-4xl font-bold tracking-wider">
              TEAM
            </h1>
          </div>
          <div className="grid gap-20 py-8 lg:grid-cols-3">
            <div className="border-gray-500 border-2 ">
              <div className="-m-0.5 aspect-square bg-zinc-100 p-4 text-center transition hover:-translate-x-3 hover:-translate-y-3 ">
                <Image
                  src="/images/client_interface/profile2.jpg"
                  width={200}
                  height={200}
                  alt=""
                  className="mx-auto rounded-full "
                />
                <h2 className="py-4 text-2xl font-semibold ">Person One</h2>
                <p className="text-gray-400 text-sm">
                  Creativity is the ability to generate, create, or discover new
                  ideas, solutions, and possibilities.
                </p>
              </div>
            </div>
            <div className="border-gray-500 border-2 ">
              <div className="-m-0.5 aspect-square bg-zinc-100 p-4 text-center transition hover:-translate-x-3 hover:-translate-y-3 ">
                <Image
                  src="/images/client_interface/profile1.jpg"
                  width={200}
                  height={200}
                  alt="p-2"
                  className="mx-auto rounded-full "
                />
                <h2 className="py-4 text-2xl font-semibold ">Person Two</h2>
                <p className="text-gray-400 text-sm">
                  Creativity is the ability to generate, create, or discover new
                  ideas, solutions, and possibilities.
                </p>
              </div>
            </div>
            <div className="border-gray-500 border-2 ">
              <div className="-m-0.5 aspect-square bg-zinc-100 p-4 text-center transition hover:-translate-x-3 hover:-translate-y-3 ">
                <Image
                  src="/images/client_interface/profile3.jpg"
                  width={200}
                  height={200}
                  alt=""
                  className="mx-auto rounded-full "
                />
                <h2 className="py-4 text-2xl font-semibold ">Person Three</h2>
                <p className="text-gray-400 text-sm">
                  Creativity is the ability to generate, create, or discover new
                  ideas, solutions, and possibilities.
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
