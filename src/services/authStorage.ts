import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "../constants/storageKeys";

export const saveLogin = async (
  token: string,
  user: any
) => {
  await AsyncStorage.multiSet([
    [
      STORAGE_KEYS.TOKEN,
      token,
    ],

    [
      STORAGE_KEYS.USER,
      JSON.stringify(user),
    ],
  ]);
};

export const getToken = async () => {
  return AsyncStorage.getItem(
    STORAGE_KEYS.TOKEN
  );
};

export const getUser = async () => {
  const user =
    await AsyncStorage.getItem(
      STORAGE_KEYS.USER
    );

  return user
    ? JSON.parse(user)
    : null;
};

export const logoutStorage =
  async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
    ]);
  };