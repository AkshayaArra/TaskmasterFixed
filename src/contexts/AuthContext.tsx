
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API_URL from "../config/api.ts";

type User = {
  _id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("taskmaster-token");

        if (!token) {
          setIsLoading(false);
          return;
        }

        console.log("Checking auth status at:", `${API_URL}/api/users/me`);
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          mode: "cors"
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // localStorage.removeItem("taskmaster-token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // localStorage.removeItem("taskmaster-token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login at:", `${API_URL}/api/auth/login`);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("taskmaster-token", data.token);
      localStorage.setItem("taskmaster-user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Unable to connect to the server. Please check your internet connection or try again later.");
      } else {
        toast.error(error instanceof Error ? error.message : "Login failed");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting registration at:", `${API_URL}/api/auth/register`);
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("taskmaster-token", data.token);
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Unable to connect to the server. Please check your internet connection or try again later.");
      } else {
        toast.error(error instanceof Error ? error.message : "Registration failed");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("taskmaster-token");
    setUser(null);
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
