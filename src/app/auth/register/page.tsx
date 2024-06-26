"use client";
import { getCompanyInfo, register } from "@/api";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { CompanyLogoData } from "@/types";
import { getImageUrl } from "@/utils";
import { Spinner } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    re_password: "",
  });
  const [companyData, setCompanyData] = useState<CompanyLogoData>({
    name: "Keystone Engineering Consultant",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, email, password, re_password } = formData;

    if (password !== re_password) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setError(null);
    const data = await register({ username, email, password });

    if (data?.error) {
      setError(data.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    toast.error(error);
  }, [error]);

  useEffect(() => {
    async function fetchCompanyData() {
      const response = await getCompanyInfo();
      setCompanyData(response);
    }
    fetchCompanyData();
  }, []);

  const logoSrc =
    companyData && companyData.logo
      ? getImageUrl(companyData.logo)
      : "/images/logo/logo.png";

  const companyName = companyData?.name ?? "Keystone Engineering Consultant";

  return (
    <div className="m-auto h-full">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="px-4 md:px-0 lg:w-6/12">
          <div className="rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] md:mx-6 md:p-12">
            {/* Logo and company name */}
            <div className="text-center">
              <Link href="/" className="flex justify-center">
                <Image
                  width={54}
                  height={32}
                  src={logoSrc}
                  alt="Logo"
                  priority
                />
              </Link>
              <h4 className="mb-8 mt-1 pb-1 text-xl font-semibold">
                {companyName}
              </h4>
            </div>
            {/* Form input  */}
            <form onSubmit={handleSubmit}>
              <p className="mb-4">Please Register with your info</p>
              {/* <!--Username input--> */}
              <div className="mb-4">
                <InputField
                  className="px-4.5 py-3"
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Username"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* <!--Email input--> */}
              <div className="mb-4">
                <InputField
                  className="px-4.5 py-3"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  onChange={handleChange}
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
                  onChange={handleChange}
                  required
                />
              </div>

              {/* <!--Confirm Password input--> */}
              <div className="mb-4">
                <InputField
                  className="px-4.5 py-3"
                  type="password"
                  name="re_password"
                  id="re_password"
                  placeholder="Re-type Password"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* <!--Submit button--> */}
              <div className="mb-8 mt-6 text-center">
                <CustomButton
                  type="submit"
                  variant="primary"
                  className="w-full uppercase"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Register</span>
                    <Spinner loading={isLoading}></Spinner>
                  </div>
                </CustomButton>

                {/* <!--Forgot password link--> */}
                {/* <a href="#!">Forgot password?</a> */}
              </div>

              {/* <!--Register button--> */}
              <div className="flex items-center justify-between pb-6">
                <p className="mb-0 mr-2">Already have an account?</p>
                <Link href="/auth/login">
                  <CustomButton variant="secondary">Log in</CustomButton>
                </Link>
              </div>
            </form>
            {/* Form input end*/}
          </div>
        </div>
        {/* Toast area start */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          theme="light"
        />{" "}
        {/* Toast area end */}
      </div>
    </div>
  );
};

export default Register;
