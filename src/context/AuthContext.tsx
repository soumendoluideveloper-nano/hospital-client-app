import React, {
  createContext,
  useState,
  useEffect,
} from "react";

import {
  getToken,
  getUser,
  saveLogin,
  logoutStorage,
} from "../services/authStorage";

interface AuthContextType {
  loading: boolean;

  isAuthenticated: boolean;

  token: string | null;

  user: any;

  login: (
    token: string,
    user: any
  ) => Promise<void>;

  logout: () => Promise<void>;

  updateUser: (
    user: any
  ) => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    token,
    setToken,
  ] = useState<
    string | null
  >(null);

  const [
    user,
    setUser,
  ] = useState<any>(null);

 useEffect(() => {
  initialize();
}, []);

const initialize = async () => {
  const startTime = Date.now();

  try {
    const savedToken = await getToken();
    const savedUser = await getUser();

    if (savedToken) {
      setToken(savedToken);
      setUser(savedUser);

      // এখানে চাইলে profile API call করতে পারো
      // await getProfileApi();
    }
  } catch (e) {
    await logoutStorage();
  } finally {
    const elapsed = Date.now() - startTime;

    const remaining = Math.max(0, 1000 - elapsed);

    setTimeout(() => {
      setLoading(false);
    }, remaining);
  }
};

  const login =
    async (
      token: string,
      user: any
    ) => {
      await saveLogin(
        token,
        user
      );

      setToken(token);

      setUser(user);
    };

  const logout =
    async () => {
      await logoutStorage();

      setToken(null);

      setUser(null);
    };

    const updateUser = async (
  userData: any
) => {
  if (!token) return;

  await saveLogin(
    token,
    userData
  );

  setUser(userData);
};

  return (
  <AuthContext.Provider
  value={{
    loading,

    isAuthenticated: !!token,

    token,

    user,

    login,

    logout,

    updateUser,
  }}
>
  {children}
</AuthContext.Provider>
  );
};