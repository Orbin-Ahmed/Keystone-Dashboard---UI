"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TbArrowUpRight } from "react-icons/tb";
import CustomButton from "../CustomButton";

const nav = [
  { href: "/", label: "HOME" },
  { href: "/view/projects", label: "PROJECTS" },
  { href: "/view/about", label: "ABOUT US" },
  { href: "/view/gallery", label: "GALLERY" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button className="block lg:hidden" onClick={() => setOpen(!isOpen)}>
        <svg
          className={`h-3 w-3 fill-current ${isOpen ? "hidden" : "block"}`}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
        <svg
          className={`h-3 w-3 fill-current ${isOpen ? "block" : "hidden"}`}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
        </svg>
      </button>

      <nav
        className={`transform gap-x-6 transition lg:flex ${isOpen ? "absolute inset-y-0 right-0 z-50 flex  translate-x-0 flex-col gap-y-6 bg-white px-8  py-12 " : "hidden max-md:translate-x-full"}`}
      >
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "font-semibold text-black" : ""}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div
        className={` ${isOpen ? "fixed inset-0 z-30 bg-black bg-opacity-50" : "hidden"} `}
        onClick={() => setOpen(false)}
      ></div>
      <a href="/view/contact">
        <CustomButton
          variant="primary"
          className="hover:bg-gray-100 hidden items-center rounded-full px-5 py-2 font-medium shadow lg:inline-flex"
        >
          Contact Us <TbArrowUpRight className="ml-2 h-5 w-5" />
        </CustomButton>
      </a>
    </>
  );
}
