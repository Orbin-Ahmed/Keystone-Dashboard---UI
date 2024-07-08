import Link from "next/link";
import CustomButton from "../CustomButton";

export default function Footer() {
  return (
    <div className="bg-zinc-100">
      <div className="container py-14 lg:grid lg:grid-cols-2">
        <div className="grid gap-4 pb-4 text-left lg:grid-cols-3 lg:pb-0">
          <div>
            <h2 className="pb-4 text-xl font-semibold">COMPANY</h2>
            <div className="flex flex-col ">
              <Link className="py-1 hover:underline" href="/view/about">
                About Us
              </Link>
              <Link className="py-1 hover:underline" href="/press">
                Press
              </Link>
              <Link className="py-1 hover:underline" href="/careers">
                Careers
              </Link>
              <Link className="py-1 hover:underline" href="/view/contact">
                Contact
              </Link>
            </div>
          </div>
          <div>
            <h2 className="pb-4 text-xl font-semibold">DEVELOPMENT</h2>
            <div className="flex flex-col ">
              <Link className="py-1 hover:underline" href="/view/about">
                Documentation
              </Link>
              <Link className="py-1 hover:underline" href="/press">
                API Reference
              </Link>
              <Link className="py-1 hover:underline" href="/careers">
                Changelog
              </Link>
              <Link className="py-1 hover:underline" href="/view/contact">
                Status
              </Link>
            </div>
          </div>
          <div>
            <h2 className="pb-4 text-xl font-semibold">CONNECT</h2>
            <div className="flex flex-col ">
              <Link className="py-1 hover:underline" href="/view/about">
                Instagram
              </Link>
              <Link className="py-1 hover:underline" href="/view/about">
                Linkedin
              </Link>
              <Link className="py-1 hover:underline" href="/view/about">
                Twitter
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t-2 pt-4 text-center lg:border-0 lg:pl-20 lg:pt-0 lg:text-left ">
          <p className="pb-4 text-xl font-semibold">STAY UPDATED</p>
          <div className="relative lg:max-w-sm">
            <input
              className="h-14 w-full rounded-full border-2 border-primary px-4 pr-20"
              type="text"
              placeholder="Email Address"
            />
            <CustomButton className="absolute right-2 top-2 h-10 rounded-full px-3 text-sm">
              Subscribe
            </CustomButton>
          </div>
          <p className="text-gray-500 pt-4">
            By subscribing to our newsletter, you agree to receive emails from
            us. Your personal data will be stored and processed in accordance
            with our Privacy Policy and you can unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Copy Right */}
      <div className="bg-zinc-200 py-10">
        <div className="text-gray-500 container text-center lg:flex lg:justify-between">
          <div className="pb-4 lg:pb-0">
            <p>&copy;2024 Ideal Home. All rights reserved </p>
          </div>
          <div className="">
            <Link className="p-4 hover:underline" href="/privacy">
              Privacy
            </Link>
            <Link className="p-4 hover:underline" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
