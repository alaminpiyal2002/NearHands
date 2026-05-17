import { useEffect, useState } from "react";
import { AuthContext } from "./authContextObject";
import {
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateMyProfile,
} from "../api/authApi";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../utils/tokenStorage";
import {
  extractErrorMessage,
  extractTokens,
  extractUser,
} from "../utils/authResponse";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    async function loadUserFromToken() {
      const accessToken = getAccessToken();

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profileData = await getMyProfile();
        setUser(extractUser(profileData));
      } catch (error) {
        console.error("Failed to load profile from saved token:", error);
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromToken();
  }, []);

  async function refreshUser() {
    const profileData = await getMyProfile();
    const normalizedUser = extractUser(profileData);

    setUser(normalizedUser);

    return normalizedUser;
  }

  async function updateProfile(profileData) {
    const responseData = await updateMyProfile(profileData);
    const normalizedUser = extractUser(responseData);

    if (normalizedUser) {
      setUser(normalizedUser);
      return normalizedUser;
    }

    return refreshUser();
  }

  async function login(credentials) {
    try {
      const responseData = await loginUser(credentials);
      const tokens = extractTokens(responseData);

      if (!tokens.access || !tokens.refresh) {
        throw new Error("Login response did not include tokens.");
      }

      saveTokens(tokens);

      const profileData = await getMyProfile();
      setUser(extractUser(profileData));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Login failed:", error);

      return {
        success: false,
        message: extractErrorMessage(error, "Login failed. Please try again."),
      };
    }
  }

  async function register(userData) {
    try {
      await registerUser(userData);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Registration failed:", error);

      return {
        success: false,
        message: extractErrorMessage(
          error,
          "Registration failed. Please try again."
        ),
      };
    }
  }

  async function logout() {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}