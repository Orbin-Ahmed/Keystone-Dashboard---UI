import Image from "next/image";

export default function Projects() {
  const projects = [
    {
      id: 1,
      name: "Bed room for family time ",
      description:
        "Badroom with a clean and comfortable design for your family. charming whit a modern design. ",
      image: "/images/client_interface/project3.jpg",
      link: "",
    },
    {
      id: 2,
      name: "Kitchen look modern and clean",
      description:
        "kitchen look modern and clean. charming whit a modern design. ",
      image: "/images/client_interface/project2.jpg",
      link: "",
    },
    {
      id: 3,
      name: "Perfect drawing room for family time",
      description:
        "Drawing room with a clean and comfortable design for your family. charming whit a modern design. ",
      image: "/images/client_interface/project4.png",
    },
  ];
  return (
    <div className="">
      <div className="bg-[url('/images/client_interface/backgroundproject.jpg')] bg-cover bg-center ">
        <h1 className="container py-64 text-6xl font-semibold tracking-widest text-white ">
          OUR PROJECTS
        </h1>
      </div>
      <div className="container grid grid-cols-2 gap-8 py-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative overflow-hidden rounded-xl"
          >
            <div>
              <Image
                src={project.image}
                width={480}
                height={380}
                alt=""
                className="w-full"
              />
            </div>
            <div className="absolute bottom-0 w-full translate-y-full flex-col items-center justify-end gap-32 bg-gradient-to-b from-transparent to-black p-12 text-xl text-white transition duration-300 ease-in-out group-hover:translate-y-0">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <p className="py-4 ">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
