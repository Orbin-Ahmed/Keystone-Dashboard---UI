import {
  ChatData,
  CompanyData,
  ImageData,
  ImageFile,
  ImageFiles,
  RegisterLoginFormData,
  UpdateSocialLinkParams,
  User,
} from "@/types";
import { getSessionStorage, storeSessionStorage } from "@/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const register = async ({
  username,
  email,
  password,
}: RegisterLoginFormData) => {
  const url = `${API_BASE_URL}api/register/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      window.location.href = "/auth/login/";
    } else {
      const errorMessage = await response.json();
      for (const key in errorMessage) {
        if (errorMessage.hasOwnProperty(key)) {
          return { error: errorMessage[key][0] };
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const login = async ({ username, password }: RegisterLoginFormData) => {
  const url = `${API_BASE_URL}api/login/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      storeSessionStorage("Token", data.Token);
      await fetchUserData();
      window.location.href = "/dashboard";
    } else {
      const errorMessage = await response.json();
      return { error: errorMessage };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const logout = async () => {
  const token = getSessionStorage("Token");
  const url = `${API_BASE_URL}api/logout/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const fetchUserData = async () => {
  const token = getSessionStorage("Token");
  try {
    const response = await fetch(`${API_BASE_URL}api/token/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      storeSessionStorage("name", responseData?.username);
      storeSessionStorage("role", String(responseData?.role));
      storeSessionStorage("photo", String(responseData?.photo));
      const user_role = responseData?.role;
      const secret_key = "6595554882";
      const encrypted_role = String(user_role * Number(secret_key));
      document.cookie = `id=${encrypted_role}; path=/`;
      return responseData;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.log(error);
  }
};

export const unsplashImageData = async (searchTerm: string, page: Number) => {
  const url = "https://api.unsplash.com";
  const access_key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  try {
    const response = await fetch(
      `${url}/search/photos?page=${page}&query=${searchTerm}&per_page=30&client_id=${access_key}`,
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const pexelsImageData = async (searchTerm: string, page: Number) => {
  const url = "https://api.pexels.com/v1";
  const access_key = process.env.NEXT_PUBLIC_PEXELS_ACCESS_KEY;

  try {
    const response = await fetch(
      `${url}/search?page=${page}&query=${searchTerm}&per_page=30`,
      {
        headers: {
          Authorization: `${access_key}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const pixabayImageData = async (searchTerm: string, page: Number) => {
  const access_key = process.env.NEXT_PUBLIC_PIXABAY_ACCESS_KEY;
  const url =
    "https://corsproxy.io/?" +
    encodeURIComponent(
      `https://pixabay.com/api?key=${access_key}&q=${searchTerm}&image_type=photo&page=${page}&per_page=30`,
    );

  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const pinterestImageData = async (searchTerm: string, page: Number) => {
  const url = `${API_BASE_URL}api/images/search?query=${searchTerm}&page_size=30&page_number=${page}`;
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAllUser = async () => {
  const url = `${API_BASE_URL}api/register/`;
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.json();
      console.log(errorMessage);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const UpdateUserDataWithID = async ({
  id,
  username,
  full_name,
  email,
  bio,
  phone,
  password,
}: User) => {
  const token = getSessionStorage("Token");
  try {
    const response = await fetch(`${API_BASE_URL}api/register/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        username,
        email,
        full_name,
        bio,
        phone,
        password,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      storeSessionStorage("name", responseData?.username);
      return responseData;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfilePicture = async (
  userId: number,
  imageFile: ImageFile,
) => {
  const token = getSessionStorage("Token");

  const formData = new FormData();
  formData.append("photo", imageFile.file);

  try {
    const response = await fetch(`${API_BASE_URL}api/register/${userId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      console.error("Error updating profile picture:", response);
    }
  } catch (error) {
    console.error("Error updating profile picture:", error);
  }
};

export const getCompanyInfo = async () => {
  const url = `${API_BASE_URL}api/company/1/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.json();
      console.log(errorMessage);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const updateCompanyInfo = async ({
  id,
  name,
  email,
  phone,
  company_intro,
  license,
  logo,
}: CompanyData) => {
  const url = `${API_BASE_URL}api/company/${id}/`;
  const token = getSessionStorage("Token");

  const formData = new FormData();

  if (logo && logo.file) {
    formData.append("logo", logo.file);
  }

  const updateData = {
    name,
    email,
    phone,
    company_intro,
    license,
  };

  Object.entries(updateData).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.json();
      console.error("Error:", errorMessage);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const postImagesURL = async (images: ImageData[]) => {
  const url = `${API_BASE_URL}api/images/url/`;
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(images),
    });

    if (response.ok) {
      return { data: "Image Successfully submitted!", success: true };
    } else {
      const errorMessage = await response.json();
      console.error("Error:", errorMessage);
      return { data: "Failed to submit images!", success: false };
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const postImageFile = async (imageFiles: ImageFiles[]) => {
  const url = `${API_BASE_URL}api/images/file/`;
  const token = getSessionStorage("Token");

  try {
    const uploadResults = [];

    for (const imageFile of imageFiles) {
      const formData = new FormData();
      formData.append("photo", imageFile.photo);
      formData.append("nationality", imageFile.nationality);
      formData.append("room_type", imageFile.room_type);
      formData.append("source", imageFile.source);
      formData.append("temperature", imageFile.temperature);
      formData.append("theme", imageFile.theme);
      formData.append("color", imageFile.color);
      formData.append("is_url", imageFile.is_url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        uploadResults.push({
          data: "Image Successfully uploaded!",
          success: true,
        });
      } else {
        const errorMessage = await response.json();
        console.error("Error:", errorMessage);
        uploadResults.push({
          data: `Failed to upload image!`,
          success: false,
        });
      }
    }

    const allSuccessful = uploadResults.every((result) => result.success);

    return {
      success: allSuccessful,
      data: allSuccessful
        ? "All images uploaded successfully!"
        : uploadResults.map((result) => result.data).join("\n"),
    };
  } catch (error) {
    console.error("Error uploading images:", error);
    return { success: false, data: "Failed to upload images!" };
  }
};

export const getAllImage = async (params?: { [key: string]: string }) => {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${API_BASE_URL}api/images/${query}`;
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.json();
      console.log(errorMessage);
    }
  } catch (e) {
    console.log(e);
  }
};

export const patchImage = async (photo: string, id: string, is_url: string) => {
  const url = `${API_BASE_URL}api/images/`;
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        photo,
        id,
        is_url,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.json();
      console.log(errorMessage);
    }
  } catch (e) {
    console.log(e);
  }
};

export const UpdateSocialLink = async ({
  social_link,
}: UpdateSocialLinkParams) => {
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(`${API_BASE_URL}api/social/update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(social_link),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      const errorData = await response.json();
      return { error: errorData };
    }
  } catch (error) {
    return error;
  }
};

export const getSocialLinkInfo = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/social/${id}`, {
      method: "Get",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      const errorData = await response.json();
      return { error: errorData };
    }
  } catch (error) {
    return error;
  }
};

export const getAllImageCount = async () => {
  const url = `${API_BASE_URL}api/total/images/`;
  const token = getSessionStorage("Token");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.json();
      console.log(errorMessage);
    }
  } catch (e) {
    console.log(e);
  }
};

// AI Editor
export const removeObject = async (
  inputImageLink: string,
  maskImage: string,
) => {
  const url =
    "https://prodapi.phot.ai/external/api/v2/user_activity/object-replacer";
  const apiKey = process.env.NEXT_PUBLIC_PHOT_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  const data = {
    input_image_link: inputImageLink,
    mask_image: maskImage,
    file_name: "removed_object.jpeg",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      const credits = responseData.remainingCredits;
      storeSessionStorage("Creds", String(credits));
      return responseData;
    } else {
      const errorMessage = await response.json();
      console.error(errorMessage);
      throw new Error(errorMessage.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fixLight = async (inputImageLink: string) => {
  const url =
    "https://prodapi.phot.ai/external/api/v2/user_activity/light-fixer-2k";
  const apiKey = process.env.NEXT_PUBLIC_PHOT_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  const data = {
    input_image_link: inputImageLink,
    file_name: "fix_light.jpg",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      const credits = responseData.remainingCredits;
      storeSessionStorage("Creds", String(credits));
      return responseData;
    } else {
      const errorMessage = await response.json();
      console.error(errorMessage);
      throw new Error(errorMessage.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const extendImage = async (inputImageLink: string) => {
  const url = "https://prodapi.phot.ai/external/api/v2/user_activity/outpaint";
  const apiKey = process.env.NEXT_PUBLIC_PHOT_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  const data = {
    input_image_link: inputImageLink,
    aspect_ratio: "LANDSCAPE",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      const credits = responseData.remainingCredits;
      storeSessionStorage("Creds", String(credits));
      return responseData;
    } else {
      const errorMessage = await response.json();
      console.error(errorMessage);
      throw new Error(errorMessage.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const chatWithAI = async (chatData: ChatData) => {
  const url =
    "https://prodapi.phot.ai/external/api/v2/user_activity/create-art";
  const apiKey = process.env.NEXT_PUBLIC_PHOT_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatData),
    });

    if (response.ok) {
      const responseData = await response.json();
      const credits = responseData.remainingCredits;
      storeSessionStorage("Creds", String(credits));
      return responseData;
    } else {
      const errorMessage = await response.json();
      console.error(errorMessage);
      throw new Error(errorMessage.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addObject = async (
  inputImageLink: string,
  maskImage: string,
  prompt: string,
) => {
  const url =
    "https://prodapi.phot.ai/external/api/v2/user_activity/object-replacer";
  const apiKey = process.env.NEXT_PUBLIC_PHOT_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  const data = {
    input_image_link: inputImageLink,
    mask_image: maskImage,
    file_name: "add_object.jpeg",
    prompt: `add ${prompt}`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      const credits = responseData.remainingCredits;
      storeSessionStorage("Creds", String(credits));
      const object_id = responseData.order_id;
      const result = await getObjectWhenReady(object_id);
      return result;
    } else {
      const errorMessage = await response.json();
      console.error(errorMessage);
      throw new Error(errorMessage.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getObject = async (order_id: string) => {
  const url = `https://prodapi.phot.ai/external/api/v2/user_activity/order-status?order_id=${order_id}`;
  const apiKey = process.env.NEXT_PUBLIC_PHOT_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      const errorMessage = await response.json();
      console.error(errorMessage);
      throw new Error(errorMessage.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getObjectWhenReady = async (order_id: string) => {
  let responseData;

  await delay(3000);

  do {
    responseData = await getObject(order_id);
    if (responseData.order_status_code === 200) {
      return responseData;
    }
    await delay(3000);
  } while (responseData.order_status_code !== 200);
};
