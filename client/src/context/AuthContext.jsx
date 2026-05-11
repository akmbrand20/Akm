import { createContext, useContext, useEffect, useState } from "react";
import { getAdminProfile, loginAdmin } from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "akm_admin_token";
const ADMIN_KEY = "akm_admin_user";

const getStoredAdmin = () => {
  try {
    const admin = localStorage.getItem(ADMIN_KEY);
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(getStoredAdmin);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  const saveAdminSession = ({ token: newToken, admin: newAdmin }) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(newAdmin));

    setToken(newToken);
    setAdmin(newAdmin);

    return newAdmin;
  };

  const login = async (email, password) => {
    const data = await loginAdmin({ email, password });

    return saveAdminSession({
      token: data.token,
      admin: data.admin,
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);

    setToken(null);
    setAdmin(null);
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const profile = await getAdminProfile();
        setAdmin(profile);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(profile));
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [token]);

  const value = {
    admin,
    token,
    loading,
    isAuthenticated: Boolean(token && admin),
    login,
    logout,
    saveAdminSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}