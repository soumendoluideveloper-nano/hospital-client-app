import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

type UnauthorizedListener = () => void;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export const onUnauthorized = (listener: UnauthorizedListener) => {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
};

export const emitUnauthorized = () => {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error in unauthorized listener:", err);
    }
  });
};

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

export const logoutStorage = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.USER,
  ]);
};