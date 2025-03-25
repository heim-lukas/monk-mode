import { API_BASE_URL } from "@/config/api";

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface ErrorResponse {
  status: string;
  message: string;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/Authenticate/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ErrorResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/Authenticate/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      const parsedError = JSON.parse(errorData) as ErrorResponse;
      throw new Error(parsedError.message);
    }

    return response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}
