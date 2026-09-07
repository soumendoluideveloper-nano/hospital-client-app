import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { apiClient } from "../../../services/api";

export interface LabTest {
  id: number;
  clinic_id: number;
  test_name: string;
  category?: string;
  description: string | null;
  price: string | number;
  report_duration: string | null;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}

export interface LabTestsResponse {
  status: number;
  message: string;
  data: LabTest[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface SingleLabTestResponse {
  status: number;
  message: string;
  data: LabTest;
}

export interface AddLabTestPayload {
  test_name: string;
  category?: string;
  description?: string;
  price: number | string;
  report_duration?: string;
}

export interface LabReport {
  id: number;
  booking_id: number;
  report_file: string | null;
  remarks: string | null;
  created_at: string;
}

export interface TestBooking {
  id: number;
  patient_id: number;
  clinic_id: number;
  lab_test_id: number;
  booking_date: string;
  booking_time: string;
  status: "Pending" | "Collected" | "Processing" | "Completed" | "Cancelled";
  created_at: string;
  patient?: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    profile_image: string | null;
  };
  lab_test?: {
    id: number;
    test_name: string;
    category?: string;
    price: string | number;
  };
  report?: LabReport | null;
}

export interface LabBookingsResponse {
  status: number;
  message: string;
  data: TestBooking[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ----------------------------------------------------
// Lab Tests APIs
// ----------------------------------------------------

export const getMyLabTestsApi = async (
  page: number = 1,
  limit: number = 20,
  category?: string
) => {
  let url = `${API_ENDPOINTS.LAB.MY_TESTS}?page=${page}&limit=${limit}`;
  if (category && category !== "All") {
    url += `&category=${encodeURIComponent(category)}`;
  }
  return await apiClient<LabTestsResponse>(url, {
    method: "GET",
  });
};

export const createLabTestApi = async (payload: AddLabTestPayload) => {
  return await apiClient<SingleLabTestResponse>(API_ENDPOINTS.LAB.TESTS, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateLabTestApi = async (
  id: number | string,
  payload: Partial<AddLabTestPayload & { status: string }>
) => {
  return await apiClient<SingleLabTestResponse>(
    `${API_ENDPOINTS.LAB.TESTS}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

export const deleteLabTestApi = async (id: number | string) => {
  return await apiClient<{ status: number; message: string }>(
    `${API_ENDPOINTS.LAB.TESTS}/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ----------------------------------------------------
// Lab Bookings APIs
// ----------------------------------------------------

export const getClinicLabBookingsApi = async (
  status?: string,
  page: number = 1,
  limit: number = 20
) => {
  let url = `${API_ENDPOINTS.LAB.BOOKINGS}?page=${page}&limit=${limit}`;
  if (status && status !== "All") {
    url += `&status=${encodeURIComponent(status)}`;
  }
  return await apiClient<LabBookingsResponse>(url, {
    method: "GET",
  });
};

export const updateLabBookingStatusApi = async (
  id: number | string,
  status: "Pending" | "Collected" | "Processing" | "Completed" | "Cancelled"
) => {
  return await apiClient<{ status: number; message: string; data: TestBooking }>(
    `${API_ENDPOINTS.LAB.BOOKINGS}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
};

// ----------------------------------------------------
// Lab Report Upload API
// ----------------------------------------------------

export const uploadLabReportApi = async (
  bookingId: number | string,
  formData: FormData
) => {
  return await apiClient<{ status: number; message: string; data: LabReport }>(
    `${API_ENDPOINTS.LAB.REPORTS}/${bookingId}`,
    {
      method: "POST",
      body: formData,
    }
  );
};
