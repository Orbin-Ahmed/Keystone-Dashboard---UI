import { ImageFile } from "@/types";
import { encryptData, getSessionStorage, storeSessionStorage } from "@/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RegisterLoginFormData = {
  username: string;
  email?: string;
  password: string;
};

interface User {
  id: number;
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  bio?: string | null;
}

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
  console.log(url);

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
      const user_role = responseData?.role;
      const secret_key = "6595554882";
      const encrypted_role = String(user_role * Number(secret_key) + 256);
      document.cookie = `id=${encrypted_role}`;
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
      `${url}/search/photos?page=${page}&query=${searchTerm}&per_page=20&client_id=${access_key}`,
    );

    if (response.ok) {
      const data = await response.json();
      return data.results;
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
      `${url}/search?page=${page}&query=${searchTerm}&per_page=20`,
      {
        headers: {
          Authorization: `${access_key}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data.photos;
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
      `https://pixabay.com/api?key=${access_key}&q=${searchTerm}&image_type=photo&page=${page}`,
    );

  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data.hits;
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
}: User) => {
  const token = getSessionStorage("Token");
  try {
    const response = await fetch(`${API_BASE_URL}api/register/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ username, email, full_name, bio, phone }),
    });

    if (response.ok) {
      const responseData = await response.json();
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
