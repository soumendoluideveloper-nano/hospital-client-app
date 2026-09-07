import { apiClient } from "../../../services/api";

import { API_ENDPOINTS } from "../../../config/apiEndpoints";
/* =========================
   SEND OTP
========================= */

export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export const sendOtpApi = (
  payload: SendOtpPayload
) => {
  console.log(API_ENDPOINTS.AUTH.CLINIC.SEND_OTP);
  return apiClient<SendOtpResponse>(
   API_ENDPOINTS.AUTH.CLINIC.SEND_OTP,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

/* =========================
   VERIFY OTP
========================= */

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

export const verifyOtpApi = (
  payload: VerifyOtpPayload
) => {
  return apiClient<VerifyOtpResponse>(
    API_ENDPOINTS.AUTH.CLINIC.VERIFY_OTP,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

/* =========================
   SIGNUP
========================= */

export interface SignupPayload {
  phone: string;

  name: string;
  owner_name: string;

  referral_code?: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  email: string;
  password: string;
}

export interface SignupResponse {
  status: string | number;
  message: string;

  data?: {
    id?: number | string;
    token?: string;
  };
}

export const signupApi = (
  payload: SignupPayload
) => {
  return apiClient(
    API_ENDPOINTS.AUTH.CLINIC.SIGNUP,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

interface LoginPayload {
  phone: string;
  password: string;
}

interface LoginResponse {
  status: string | number;
  message: string;

  data?: {
   
    token?: string;
    clinic?: any;
  };
}

export const loginApi = (payload: LoginPayload) =>
  apiClient<LoginResponse>(
    API_ENDPOINTS.AUTH.CLINIC.LOGIN,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );



  export interface ClinicProfile {
  id: number;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  image?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: ClinicProfile;
}

export const getProfileApi = (
) => {
  return apiClient<ProfileResponse>(
    API_ENDPOINTS.AUTH.CLINIC.PROFILE,
    {
      method: "GET",
    }
  );
};