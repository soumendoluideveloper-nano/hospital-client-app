import { Platform } from "react-native";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
  ImagePickerResult,
} from "expo-image-picker";

export interface ImageFilePayload {
  uri: string;
  name: string;
  type: string;
}

export interface PickImageResult {
  success: boolean;
  canceled?: boolean;
  uri?: string;
  filePayload?: ImageFilePayload;
  error?: string;
  permissionDenied?: boolean;
}

/**
 * Extracts normalized file info (URI, Name, MIME type) for multipart upload
 */
export function prepareMultipartImage(
  uri: string,
  fallbackNamePrefix: string = "photo"
): ImageFilePayload {
  // Normalize URI for platform
  const cleanUri =
    Platform.OS === "android"
      ? uri
      : uri.replace("file://", "");

  // Determine filename and extension
  const uriParts = uri.split("/");
  let fileName = uriParts[uriParts.length - 1] || `${fallbackNamePrefix}_${Date.now()}.jpg`;

  // Strip query params if any
  if (fileName.includes("?")) {
    fileName = fileName.split("?")[0];
  }

  let ext = "jpg";
  if (fileName.includes(".")) {
    const parts = fileName.split(".");
    ext = parts[parts.length - 1].toLowerCase();
  } else {
    fileName = `${fileName}.jpg`;
  }

  // Determine MIME type
  let mimeType = "image/jpeg";
  if (ext === "png") {
    mimeType = "image/png";
  } else if (ext === "webp") {
    mimeType = "image/webp";
  } else if (ext === "gif") {
    mimeType = "image/gif";
  }

  return {
    uri: uri, // Use full URI for React Native FormData
    name: fileName,
    type: mimeType,
  };
}

/**
 * Pick image from Camera with permission checks and compression
 */
export async function pickImageFromCamera(
  aspect: [number, number] = [1, 1],
  quality: number = 0.7
): Promise<PickImageResult> {
  try {
    const permission = await requestCameraPermissionsAsync();
    if (!permission.granted) {
      return {
        success: false,
        permissionDenied: true,
        error: "Camera permission is required to take a photo.",
      };
    }

    const result: ImagePickerResult = await launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, canceled: true };
    }

    const asset = result.assets[0];
    const filePayload = prepareMultipartImage(
      asset.uri,
      "camera_capture"
    );

    if (asset.mimeType) {
      filePayload.type = asset.mimeType;
    }
    if (asset.fileName) {
      filePayload.name = asset.fileName;
    }

    return {
      success: true,
      uri: asset.uri,
      filePayload,
    };
  } catch (error: any) {
    console.log("Camera capture error:", error);
    return {
      success: false,
      error: error?.message || "Could not open camera.",
    };
  }
}

/**
 * Pick image from Photo Gallery with permission checks and compression
 */
export async function pickImageFromGallery(
  aspect: [number, number] = [1, 1],
  quality: number = 0.7
): Promise<PickImageResult> {
  try {
    const permission = await requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return {
        success: false,
        permissionDenied: true,
        error: "Gallery access permission is required to select a photo.",
      };
    }

    const result: ImagePickerResult = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, canceled: true };
    }

    const asset = result.assets[0];
    const filePayload = prepareMultipartImage(
      asset.uri,
      "gallery_photo"
    );

    if (asset.mimeType) {
      filePayload.type = asset.mimeType;
    }
    if (asset.fileName) {
      filePayload.name = asset.fileName;
    }

    return {
      success: true,
      uri: asset.uri,
      filePayload,
    };
  } catch (error: any) {
    console.log("Gallery selection error:", error);
    return {
      success: false,
      error: error?.message || "Could not open gallery.",
    };
  }
}
