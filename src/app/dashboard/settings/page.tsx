"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  UpdateSocialLink,
  UpdateUserDataWithID,
  fetchUserData,
  getCompanyInfo,
  getSocialLinkInfo,
  updateCompanyInfo,
  updateUserProfilePicture,
} from "@/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from "@radix-ui/themes";
import { ImageFile, SocialLink } from "@/types";
import { getImageUrl, getSessionStorage } from "@/utils";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [companyForm, setCompanyForm] = useState({});
  const [passwordData, setPasswordData] = useState({
    password: "",
    password1: "",
  });
  const [userData, setUserData] = useState({
    id: 0,
    username: "",
    email: "",
    role: 0,
    is_active: false,
    full_name: null,
    phone: null,
    bio: null,
    photo: null,
  });

  const [companyData, setCompanyData] = useState({
    id: 1,
    name: "",
    email: "",
    phone: "",
    company_intro: "",
    license: "",
    logo: null,
  });
  const [role, setRole] = useState<number | undefined>();

  const [socialLinks, setSocialLinks] = useState({
    fb_link: "",
    tw_link: "",
    ld_link: "",
    web_link: "",
    git_link: "",
  });

  useEffect(() => {
    const storedRole = getSessionStorage("role");
    const parsedRole =
      storedRole !== null ? parseInt(storedRole, 10) : undefined;
    setRole(parsedRole);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePassChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const userId = userData.id;

    const imageFile: ImageFile = {
      file: selectedFile,
      filename: selectedFile.name,
    };
    const response = await updateUserProfilePicture(userId, imageFile);
    if (response) {
      setUserData(response);
      toast.success("Profile photo updated sucessfully!");
    } else {
      toast.error("Profile photo could not be updated!");
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const { password, password1 } = passwordData;

    if (password !== password1) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    setError(null);

    const data = await UpdateUserDataWithID({
      id: userData.id,
      password: password,
    });

    if (data?.error) {
      setError(data.error);
    } else {
      toast.success("Passwords changed successfully!");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const data = await UpdateUserDataWithID({ id: userData.id, ...formData });

    if (data?.error) {
      setError(data.error);
    }

    setIsLoading(false);
  };

  const handleCompanyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;

    if (name === "logo" && files && files.length > 0) {
      const selectedFile = files[0];
      setCompanyForm((prevForm) => ({
        ...prevForm,
        logo: { file: selectedFile },
      }));
    } else {
      setCompanyForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleCompanyTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setCompanyForm({
      ...companyForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCompanySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const data = await updateCompanyInfo({
      id: companyData.id,
      ...companyForm,
    });

    if (data?.error) {
      setError(data.error);
    }

    setIsLoading(false);
  };

  const handleSocialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [name]: value,
    }));
  };

  const handleSocialLinkSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const socialLinkBody = [
      { platform: "facebook", link: socialLinks.fb_link },
      { platform: "twitter", link: socialLinks.tw_link },
      { platform: "linkedin", link: socialLinks.ld_link },
      { platform: "website", link: socialLinks.web_link },
      { platform: "github", link: socialLinks.git_link },
    ];

    setIsLoading(true);
    setError(null);

    const data = await UpdateSocialLink({
      social_link: socialLinkBody,
    });

    if (data?.error) {
      setError(data.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const response = await fetchUserData();
        setUserData(response);
      } catch (error) {
        console.log(error);
      }
    };
    getProfileData();
  }, []);

  useEffect(() => {
    const getCompanyData = async () => {
      try {
        const response = await getCompanyInfo();
        setCompanyData(response);
      } catch (error) {
        console.log(error);
      }
    };
    getCompanyData();
  }, []);

  useEffect(() => {
    const getSocialLinkData = async () => {
      try {
        const response: SocialLink[] = await getSocialLinkInfo(userData.id);
        const linkMap: {
          [key in SocialLink["platform"]]: keyof typeof socialLinks;
        } = {
          facebook: "fb_link",
          twitter: "tw_link",
          linkedin: "ld_link",
          website: "web_link",
          github: "git_link",
        };
        const links = response.reduce(
          (acc, link) => {
            const key = linkMap[link.platform];
            if (key) {
              acc[key] = link.link;
            }
            return acc;
          },
          {} as typeof socialLinks,
        );
        setSocialLinks((prevLinks) => ({
          ...prevLinks,
          ...links,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    if (userData.id != 0) {
      getSocialLinkData();
    }
  }, [userData.id]);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    {/* Full Name Field */}
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="fullName"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <InputField
                          type="text"
                          name="full_name"
                          id="full_name"
                          placeholder="Your Full Name"
                          onChange={handleChange}
                          defaultValue={
                            userData.full_name ? userData.full_name : ""
                          }
                        />
                      </div>
                    </div>
                    {/* Full Name Field end */}

                    {/* Phone Field  */}
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phoneNumber"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            version="1.0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 100.000000 100.000000"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <g
                              transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)"
                              fill=""
                              stroke="none"
                            >
                              <path
                                d="M185 921 c-51 -31 -125 -117 -125 -146 0 -49 42 -151 98 -235 73
                                  -112 270 -309 382 -382 84 -56 186 -98 235 -98 29 0 127 86 151 132 27 53 20
                                  63 -91 138 -57 38 -112 70 -122 70 -10 0 -40 -11 -66 -26 -26 -14 -56 -23 -66
                                  -19 -22 7 -231 218 -231 234 0 6 11 34 25 61 14 27 25 56 25 65 0 9 -32 63
                                  -70 120 -77 114 -88 121 -145 86z m115 -111 c33 -49 60 -93 60 -98 0 -5 -14
                                  -34 -31 -66 -30 -55 -30 -57 -13 -84 22 -35 211 -224 246 -246 27 -17 29 -17
                                  84 13 32 17 61 31 66 31 14 0 188 -119 188 -129 0 -14 -71 -99 -97 -116 -73
                                  -48 -261 62 -463 272 -158 163 -254 325 -236 397 6 23 107 116 127 116 5 0 36
                                  -40 69 -90z"
                              />
                            </g>
                          </svg>
                        </span>
                        <InputField
                          type="text"
                          name="phone"
                          id="phone"
                          placeholder="Your Phone No."
                          onChange={handleChange}
                          defaultValue={userData.phone ? userData.phone : ""}
                        />
                      </div>
                    </div>
                    {/* Phone Field end */}
                  </div>

                  {/* Email Field  */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                      <InputField
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Your Email"
                        onChange={handleChange}
                        defaultValue={userData.email ? userData.email : ""}
                      />
                    </div>
                  </div>
                  {/* Email Field end */}

                  {/* Username Field */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="Username"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                      <InputField
                        type="text"
                        name="username"
                        id="username"
                        placeholder="Your Username"
                        onChange={handleChange}
                        defaultValue={
                          userData.username ? userData.username : ""
                        }
                      />
                    </div>
                  </div>
                  {/* Username Field end */}

                  {/* Bio Field */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="Username"
                    >
                      BIO
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8" clipPath="url(#clip0_88_10224)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884ZM14.8271 1.49402C15.3149 1.00622 15.9765 0.732178 16.6664 0.732178C17.3562 0.732178 18.0178 1.00622 18.5056 1.49402C18.9934 1.98182 19.2675 2.64342 19.2675 3.33328C19.2675 4.02313 18.9934 4.68473 18.5056 5.17253L10.5889 13.0892C10.4821 13.196 10.3483 13.2718 10.2018 13.3084L6.86847 14.1417C6.58449 14.2127 6.28409 14.1295 6.0771 13.9225C5.87012 13.7156 5.78691 13.4151 5.85791 13.1312L6.69124 9.79783C6.72787 9.65131 6.80364 9.51749 6.91044 9.41069L14.8271 1.49402Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_88_10224">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>

                      <textarea
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="bio"
                        id="bio"
                        rows={6}
                        placeholder="Write your bio here"
                        onChange={handleTextChange}
                        defaultValue={userData.bio ? userData.bio : ""}
                      ></textarea>
                    </div>
                  </div>
                  {/* Bio Field end */}
                  <div className="flex justify-end gap-4.5">
                    <CustomButton type="button" variant="tertiary">
                      Cancel
                    </CustomButton>
                    <CustomButton type="submit" disabled={isLoading}>
                      <div className="flex items-center justify-center">
                        <span className="mr-2">Save</span>
                        <Spinner loading={isLoading}></Spinner>
                      </div>
                    </CustomButton>
                  </div>
                </form>
              </div>
            </div>
            {role === 1 && (
              <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Company Information
                  </h3>
                </div>
                <div className="p-7">
                  <form onSubmit={handleCompanySubmit}>
                    {/* License and phone field  */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      {/* Company License Field */}
                      <div className="mb-5.5 w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="clicense"
                        >
                          Comapany License
                        </label>
                        <InputField
                          className="px-4.5 py-3"
                          type="text"
                          name="license"
                          id="license"
                          placeholder="Company License"
                          onChange={handleCompanyChange}
                          defaultValue={
                            companyData.license ? companyData.license : ""
                          }
                        />
                      </div>
                      {/* Company License Field end */}

                      {/* Company Phone Field  */}
                      <div className="mb-5.5 w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="cphone"
                        >
                          Company Phone Number
                        </label>
                        <InputField
                          className="px-4.5 py-3"
                          type="text"
                          name="cphone"
                          id="cphone"
                          placeholder="Your Phone No."
                          defaultValue={
                            companyData.phone ? companyData.phone : ""
                          }
                        />
                      </div>
                      {/* Company Phone Field end */}
                    </div>

                    {/* Email Field  */}
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="cemail"
                      >
                        Company Email Address
                      </label>
                      <InputField
                        className="px-4.5 py-3"
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Your Company Email"
                        onChange={handleCompanyChange}
                        defaultValue={
                          companyData.email ? companyData.email : ""
                        }
                      />
                    </div>
                    {/* Email Field end */}

                    {/* Company Name Field */}
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="cname"
                      >
                        Comapany Name
                      </label>
                      <InputField
                        className="px-4.5 py-3"
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Company Name"
                        onChange={handleCompanyChange}
                        defaultValue={companyData.name ? companyData.name : ""}
                      />
                    </div>
                    {/* Company Name Field end */}

                    {/* Comapny Intro Field */}
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="cbio"
                      >
                        Company Intro
                      </label>

                      <textarea
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="company_intro"
                        id="company_intro"
                        rows={8}
                        onChange={handleCompanyTextChange}
                        placeholder="Write your comapny introduction here"
                        defaultValue={
                          companyData.company_intro
                            ? companyData.company_intro
                            : ""
                        }
                      ></textarea>
                    </div>
                    {/* Comapny Intro end */}

                    {/* Comapny Logo Field */}
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="clogo"
                      >
                        Logo
                      </label>
                      <InputField
                        className="px-4.5 py-3"
                        type="file"
                        accept="image/*"
                        onChange={handleCompanyChange}
                        name="logo"
                        id="logo"
                      />
                    </div>
                    {/* Comapny Logo end */}
                    <div className="flex justify-end gap-4.5">
                      <CustomButton variant="tertiary">Cancel</CustomButton>
                      <CustomButton type="submit" disabled={isLoading}>
                        <div className="flex items-center justify-center">
                          <span className="mr-2">Save</span>
                          <Spinner loading={isLoading}></Spinner>
                        </div>
                      </CustomButton>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* Right Card Start  */}
          <div className="col-span-5 xl:col-span-2">
            {/* Top Card  */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Your Photo
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="mb-6 h-14 w-14 rounded-full">
                      <Image
                        height={122}
                        width={122}
                        className="h-14"
                        src={
                          userData.photo
                            ? getImageUrl(userData.photo)
                            : "https://avatar.iran.liara.run/public/boy"
                        }
                        style={{ borderRadius: "50%" }}
                        alt="User"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 text-black dark:text-white">
                        Edit your photo
                      </span>
                    </div>
                  </div>

                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleProfilePictureChange}
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">PNG / JPG Format</p>
                    </div>
                  </div>

                  {/* <div className="flex justify-end gap-4.5">
                    <CustomButton variant="tertiary">Cancel</CustomButton>
                    <CustomButton>Save</CustomButton>
                  </div> */}
                </form>
              </div>
            </div>
            {/* Bottom Card  */}
            <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Change Password
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handlePasswordSubmit}>
                  {/* New Pass */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      New Password
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="password"
                      name="password"
                      id="password"
                      onChange={handlePassChange}
                      placeholder="New Password"
                    />
                  </div>
                  {/* Confirm New Pass */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      Confirm Password
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="password"
                      name="password1"
                      id="password1"
                      onChange={handlePassChange}
                      placeholder="Confirm Password"
                    />
                  </div>
                  <div className="flex justify-end gap-4.5">
                    <CustomButton type="submit" disabled={isLoading}>
                      <div className="flex items-center justify-center">
                        <span className="mr-2">Save</span>
                        <Spinner loading={isLoading}></Spinner>
                      </div>
                    </CustomButton>
                  </div>
                </form>
              </div>
            </div>
            {/* Social Media Link  */}
            <div className="mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Social Media Link
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSocialLinkSubmit}>
                  {/* Facebook */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="fb_link"
                    >
                      Facebook Link
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="text"
                      name="fb_link"
                      id="fb_link"
                      value={socialLinks.fb_link}
                      onChange={handleSocialChange}
                      placeholder="Facebook Profile Link"
                    />
                  </div>
                  {/* Twitter */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="tw_link"
                    >
                      Twitter Link
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="text"
                      name="tw_link"
                      id="tw_link"
                      value={socialLinks.tw_link}
                      onChange={handleSocialChange}
                      placeholder="Twitter Profile Link"
                    />
                  </div>
                  {/* LinkdIN */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="ld_link"
                    >
                      LinkdIN Link
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="text"
                      name="ld_link"
                      id="ld_link"
                      value={socialLinks.ld_link}
                      onChange={handleSocialChange}
                      placeholder="LinkdIN Profile Link"
                    />
                  </div>
                  {/* Website */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="web_link"
                    >
                      Website Link
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="text"
                      name="web_link"
                      id="web_link"
                      value={socialLinks.web_link}
                      onChange={handleSocialChange}
                      placeholder="Personal Website Link"
                    />
                  </div>
                  {/* Github */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="git_link"
                    >
                      Github Link
                    </label>
                    <InputField
                      className="px-4.5 py-3"
                      type="text"
                      name="git_link"
                      id="git_link"
                      value={socialLinks.git_link}
                      onChange={handleSocialChange}
                      placeholder="Github Profile Link"
                    />
                  </div>
                  <div className="flex justify-end gap-4.5">
                    <CustomButton type="submit" disabled={isLoading}>
                      <div className="flex items-center justify-center">
                        <span className="mr-2">Save</span>
                        <Spinner loading={isLoading}></Spinner>
                      </div>
                    </CustomButton>
                  </div>
                </form>
              </div>
            </div>
            {/* Social Media Link end */}
          </div>
          {/* Right Card end  */}
          {/* Toast area start */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            theme="light"
          />{" "}
          {/* Toast area end */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;
