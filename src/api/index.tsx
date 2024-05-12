const BASE_URL = process.env.BASE_URL;

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
};

export const register = async ({
  username,
  email,
  password,
}: RegisterFormData) => {
  const url = `http://127.0.0.1:8000/api/register/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
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
