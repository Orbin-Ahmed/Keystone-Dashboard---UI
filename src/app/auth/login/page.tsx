"use client";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { Spinner } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { getCompanyInfo, login } from "@/api";
import { getImageUrl } from "@/utils";
import { CompanyLogoData } from "@/types";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState<CompanyLogoData>({
    name: "Keystone Engineering Consultant",
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, password } = formData;

    setIsLoading(true);
    setError(null);
    const data = await login({ username, password });

    if (data?.error) {
      setError(data.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    toast.error(error);
  }, [error]);

  useEffect(() => {
    // Fetch company data
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
          <div className="rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] md:mx-6 md:p-12">
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
              <p className="mb-4">Please login to your account</p>
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

              {/* <!--Submit button--> */}
              <div className="mb-8 mt-6 text-center">
                <CustomButton
                  type="submit"
                  variant="primary"
                  className="w-full uppercase"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">Log in</span>
                    <Spinner loading={isLoading}></Spinner>
                  </div>
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

export default Login;
