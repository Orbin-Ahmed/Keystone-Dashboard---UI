import { getSessionStorage, storeSessionStorage } from "@/utils";

// const API_BASE_URL = "http://127.0.0.1:8000/";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RegisterLoginFormData = {
  username: string;
  email?: string;
  password: string;
};

export const register = async ({
  username,
  email,
  password,
}: RegisterLoginFormData) => {
  const url = `${API_BASE_URL}/api/register/`;

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

const fetchUserData = async () => {
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
      return data;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
