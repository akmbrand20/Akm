import { createContext, useContext, useEffect, useState } from "react";
import {
  getCustomerProfile,
  loginCustomer,
  signupCustomer,
} from "../services/customerAuthService";

const CustomerAuthContext = createContext(null);

const TOKEN_KEY = "akm_customer_token";
const CUSTOMER_KEY = "akm_customer_user";

const getStoredCustomer = () => {
  try {
    const customer = localStorage.getItem(CUSTOMER_KEY);
    return customer ? JSON.parse(customer) : null;
  } catch (error) {
    return null;
  }
};

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(getStoredCustomer);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  const saveCustomerSession = ({ token: newToken, customer: newCustomer }) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(newCustomer));

    setToken(newToken);
    setCustomer(newCustomer);

    return newCustomer;
  };

  const signup = async (customerData) => {
    const data = await signupCustomer(customerData);

    return saveCustomerSession({
      token: data.token,
      customer: data.customer,
    });
  };

  const login = async (email, password) => {
    const data = await loginCustomer({ email, password });

    return saveCustomerSession({
      token: data.token,
      customer: data.customer,
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);

    setToken(null);
    setCustomer(null);
  };

  useEffect(() => {
    const verifyCustomer = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const profile = await getCustomerProfile();
        setCustomer(profile);
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(profile));
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyCustomer();
  }, [token]);

  const value = {
    customer,
    token,
    loading,
    isCustomerLoggedIn: Boolean(token && customer),
    signup,
    login,
    logout,
    saveCustomerSession,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  }

  return context;
}