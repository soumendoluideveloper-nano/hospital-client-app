// utils/profileImage.ts

import * as FileSystem from "expo-file-system/legacy";

const PROFILE_IMAGE =
  `${FileSystem.documentDirectory}profile-image.jpg`;

export const saveProfileImage = async (
  remoteUrl: string
) => {
  try {
    const result =
      await FileSystem.downloadAsync(
        remoteUrl,
        PROFILE_IMAGE
      );

    return result.uri;
  } catch (error) {
    console.log(
      "Save profile image error:",
      error
    );

    return null;
  }
};

export const getLocalProfileImage =
  async () => {
    try {
      const info =
        await FileSystem.getInfoAsync(
          PROFILE_IMAGE
        );

      if (info.exists) {
        return info.uri;
      }

      return null;
    } catch (error) {
      console.log(
        "Get local profile image error:",
        error
      );

      return null;
    }
  };

export const deleteLocalProfileImage =
  async () => {
    try {
      const info =
        await FileSystem.getInfoAsync(
          PROFILE_IMAGE
        );

      if (info.exists) {
        await FileSystem.deleteAsync(
          PROFILE_IMAGE,
          {
            idempotent: true,
          }
        );
      }
    } catch (error) {
      console.log(
        "Delete profile image error:",
        error
      );
    }
  };