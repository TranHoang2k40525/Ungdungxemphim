import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load user và token từ AsyncStorage khi app start
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log("Lỗi load user từ storage:", err);
      }
    };
    loadUserData();
  }, []);

  // Hàm update user và lưu vào storage
  const updateUser = async (newUser, newToken) => {
    try {
      setUser(newUser);
      setToken(newToken);
      if (newUser && newToken) {
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        await AsyncStorage.setItem("token", newToken);
      } else {
        // Nếu logout, xóa storage
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
      }
    } catch (err) {
      console.log("Lỗi lưu user vào storage:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};