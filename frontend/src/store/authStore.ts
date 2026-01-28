import { create } from "zustand";
import { User, LoginCredentials, RegisterData, AuthResponse } from "@/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log("🔐 Starting login process...");
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      console.log("📤 Sending login request...");
      const response = await api.post<AuthResponse>("/auth/login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Login response received:", response.data);
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      set({ token: access_token });
      console.log("💾 Token saved to localStorage");

      // Fetch user data
      console.log("👤 Fetching user data...");
      const userResponse = await api.get<User>("/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      console.log("✅ User data received:", userResponse.data);
      set({ user: userResponse.data, isLoading: false });
      console.log("🎉 Login successful!");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.detail || error.message || "Login failed";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      console.log("📝 Starting registration process...");
      console.log("Registration data:", { ...data, password: "***" });
      const response = await api.post<User>("/auth/register", data);
      console.log("✅ Registration successful:", response.data);
      set({ isLoading: false });
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.detail || error.message || "Registration failed";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await api.get<User>("/auth/me");
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem("token");
    }
  },

  setUser: (user) => set({ user }),
}));
