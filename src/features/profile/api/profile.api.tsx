import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { apiClient } from "../../../services/api";

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const changePasswordApi = async (
  payload: ChangePasswordPayload
) => {
  return await apiClient(
    API_ENDPOINTS.AUTH.CLINIC.CHANGE_PASSWORD,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

export interface UpdateProfilePayload {
  name: string;
  owner_name: string;
  email: string;
  registration_no: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  latitude?: number | string;
  longitude?: number | string;
  description: string;
  has_lab: boolean;
  logo?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

export interface UpdateProfileResponse {
  status: number;
  message: string;
  data?: {
    clinic?: any;
    user?: any;
  };
}

export const updateProfileApi = async (
  payload: UpdateProfilePayload
) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("owner_name", payload.owner_name);
  formData.append("email", payload.email);
  formData.append(
    "registration_no",
    payload.registration_no
  );
  formData.append("address", payload.address);
  formData.append("city", payload.city);
  formData.append("state", payload.state);
  formData.append("country", payload.country);
  if (payload.pincode) {
    formData.append("pincode", payload.pincode);
  }
  if (payload.latitude !== undefined && payload.latitude !== "") {
    formData.append("latitude", String(payload.latitude));
  }
  if (payload.longitude !== undefined && payload.longitude !== "") {
    formData.append("longitude", String(payload.longitude));
  }
  formData.append(
    "description",
    payload.description
  );
  formData.append(
    "has_lab",
    payload.has_lab ? "true" : "false"
  );

  if (payload.logo?.uri) {
    formData.append("logo", {
      uri: payload.logo.uri,
      name: payload.logo.name,
      type: payload.logo.type,
    } as any);
  }

  return await apiClient<UpdateProfileResponse>(
    API_ENDPOINTS.AUTH.CLINIC.UPDATE_PROFILE,
    {
      method: "PUT",
      body: formData,
    }
  );
};