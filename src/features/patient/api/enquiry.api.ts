import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { apiClient } from "../../../services/api";
import {
  EnquiryItem,
  EnquiryDetailsResponse,
} from "../types/patient.types";

export interface EnquiryListResponse {
  status: number;
  message: string;
  data: EnquiryItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface EnquiryDetailsApiResponse {
  status: number;
  message: string;
  data: EnquiryDetailsResponse;
}

export interface SingleEnquiryApiResponse {
  status: number;
  message: string;
  data: {
    enquiry: EnquiryItem;
    appointment?: any;
  } | EnquiryItem;
}

export const getEnquiriesApi = async (params?: {
  status?: string;
  doctor_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<EnquiryListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== "ALL") queryParams.append("status", params.status);
  if (params?.doctor_id) queryParams.append("doctor_id", String(params.doctor_id));
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const queryStr = queryParams.toString();
  const url = `${API_ENDPOINTS.ENQUIRY.LIST}${queryStr ? `?${queryStr}` : ""}`;
  return await apiClient<EnquiryListResponse>(url, {
    method: "GET",
  });
};

export const getEnquiryDetailsApi = async (
  id: number | string
): Promise<EnquiryDetailsApiResponse> => {
  return await apiClient<EnquiryDetailsApiResponse>(
    API_ENDPOINTS.ENQUIRY.DETAILS(id),
    {
      method: "GET",
    }
  );
};

export const acceptEnquiryApi = async (
  id: number | string,
  payload?: {
    appointment_date?: string;
    appointment_time?: string;
    doctor_id?: number;
    notes?: string;
  }
): Promise<SingleEnquiryApiResponse> => {
  return await apiClient<SingleEnquiryApiResponse>(
    API_ENDPOINTS.ENQUIRY.ACCEPT(id),
    {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }
  );
};

export const cancelEnquiryApi = async (
  id: number | string,
  payload?: { reason?: string }
): Promise<SingleEnquiryApiResponse> => {
  return await apiClient<SingleEnquiryApiResponse>(
    API_ENDPOINTS.ENQUIRY.CANCEL(id),
    {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }
  );
};

export const updateEnquiryStatusApi = async (
  id: number | string,
  payload: { status: string; reply?: string }
): Promise<SingleEnquiryApiResponse> => {
  return await apiClient<SingleEnquiryApiResponse>(
    API_ENDPOINTS.ENQUIRY.STATUS(id),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};
