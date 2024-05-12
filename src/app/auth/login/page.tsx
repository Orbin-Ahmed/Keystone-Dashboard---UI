import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Login = () => {
  return (
    <div className="m-auto h-screen">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="px-4 md:px-0 lg:w-6/12">
          <div className="rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] md:mx-6 md:p-12">
            {/* Logo and company name */}
            <div className="text-center">
              <Link href="/" className="flex justify-center">
                <Image
                  width={54}
                  height={32}
                  src={"/images/logo/logo.png"}
                  alt="Logo"
                  priority
                />
              </Link>
              <h4 className="mb-8 mt-1 pb-1 text-xl font-semibold">
                Keystone Engineering Consultant
              </h4>
            </div>
            {/* Form input  */}
            <form>
              <p className="mb-4">Please login to your account</p>
              {/* <!--Username input--> */}
              <div className="mb-4">
                <InputField
                  className="px-4.5 py-3"
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Username"
                  required
                />
              </div>

              {/* <!--Password input--> */}
              <div className="mb-4">
                <InputField
                  className="px-4.5 py-3"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  required
                />
              </div>

              {/* <!--Submit button--> */}
              <div className="mb-8 mt-6 text-center">
                <CustomButton
                  type="submit"
                  variant="primary"
                  className="w-full uppercase"
                >
                  Log in
                </CustomButton>

                {/* <!--Forgot password link--> */}
                {/* <a href="#!">Forgot password?</a> */}
              </div>

              {/* <!--Register button--> */}
              <div className="flex items-center justify-between pb-6">
                <p className="mb-0 mr-2">Don't have an account?</p>
                <Link href="/auth/register">
                  <CustomButton variant="secondary">Register</CustomButton>
                </Link>
              </div>
            </form>
            {/* Form input end*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
