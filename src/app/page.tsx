import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home || Keystone Engineering Consultant",
  description: "This is the Home Page.",
};

export default function Home() {
  return (
    <>
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <h1>This is the Home page.</h1>
        <p>
          <Link href="/auth/login/" className="text-primary">
            Login
          </Link>{" "}
          to admin dashboard
        </p>
      </div>
    </>
  );
}
