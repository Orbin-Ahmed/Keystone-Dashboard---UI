import Image from "next/image";

export default function Projects() {
  const projects = [
    {
      id: 1,
      name: "Khalifa Villa - Mr. Saood Aljneibi",
      description:
        "Bedroom with a clean and comfortable design for your family. Charming with a modern design.",
      image: "/images/view/(1).jpg",
      link: "",
    },
    {
      id: 2,
      name: "Al Rumaithi Villa",
      description:
        "Kitchen look modern and clean. Charming with a modern design.",
      image: "/images/view/(7).jpg",
      link: "",
    },
    {
      id: 3,
      name: "Al Mainaah Villa",
      description:
        "Drawing room with a clean and comfortable design for your family. Charming with a modern design.",
      image: "/images/view/(8).jpg",
    },
  ];

  return (
    <div>
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/images/view/(5).jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        <div className="container relative py-64 text-6xl font-semibold tracking-widest text-white">
          OUR PROJECTS
        </div>
      </div>
      <div className="container grid grid-cols-2 gap-8 py-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl"
          >
            <Image
              src={project.image}
              alt={project.name}
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
            />
            <div className="absolute bottom-0 w-full translate-y-full flex-col items-center justify-end bg-gradient-to-b from-transparent to-black p-12 text-xl text-white transition duration-300 ease-in-out group-hover:translate-y-0">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              {/* <p className="py-4">{project.description}</p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
