import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user_id, setUserID] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem("userToken");
      const storedUser = await AsyncStorage.getItem("userData");
      console.log("Stored token:", storedToken);
      console.log("Stored user:", storedUser);
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        setUserID(JSON.parse(storedUser.user_id));
      }
      setIsAuthenticated(!!storedToken);
    };

    fetchToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        user_id,
        setUserID,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
