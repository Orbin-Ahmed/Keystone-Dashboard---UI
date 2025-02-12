import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home || Ideal Home Interior",
  description: "This is the Home Page.",
};

export default function Home() {
  return (
    <>
      <div className="bg-gray-100 flex min-h-screen items-center justify-center">
        <div className="space-x-4">
          <Link href="/dashboard">
            <button className="rounded-xl bg-blue-500 px-6 py-3 text-white shadow-md transition hover:bg-blue-600">
              Login
            </button>
          </Link>
          <Link href="https://www.idealhomeuae.com/">
            <button className="rounded-xl bg-green-500 px-6 py-3 text-white shadow-md transition hover:bg-green-600">
              Home
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
