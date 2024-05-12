import { storeSessionStorage } from "@/utils";

const API_BASE_URL = "http://127.0.0.1:8000/";

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
  const url = `${API_BASE_URL}/api/login/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      storeSessionStorage("Token", data.Token);
      window.location.href = "/dashboard";
    } else {
      const errorMessage = await response.json();
      return { error: errorMessage };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
