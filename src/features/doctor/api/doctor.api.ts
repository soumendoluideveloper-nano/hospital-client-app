import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { apiClient } from "../../../services/api";

// =====================================================
// Add Doctor
// =====================================================

export interface AddDoctorPayload {
  name: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string;
  experience: number;
  registration_no: string;
  consultation_fee: number;
  about: string;
}

export interface AddDoctorResponse {
  status: number;
  message: string;
  data?: {
    doctor?: any;
  };
}

export const addDoctorApi = async (
  payload: AddDoctorPayload
) => {
  return await apiClient<AddDoctorResponse>(
    API_ENDPOINTS.DOCTOR.CREATE,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// =====================================================
// Doctor
// =====================================================

export interface Doctor {
  id: number;
  clinic_id: number;

  name: string;
  phone: string | null;
  email: string | null;

  qualification: string;
  specialization: string;

  experience: number;

  registration_no: string | null;

  consultation_fee: string;

  about: string;

  profile_image: string | null;

  status: string;

  created_at: string;
  updated_at: string;

  schedules?: any[];
}

// =====================================================
// Doctor List
// =====================================================

export interface DoctorListResponse {
  status: number;
  message: string;

  data: Doctor[];

  meta: {
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}

export const listDoctorsApi = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  let url =
    `${API_ENDPOINTS.DOCTOR.LIST}` +
    `?page=${page}` +
    `&limit=${limit}`;

  if (search?.trim()) {
    url += `&search=${encodeURIComponent(
      search.trim()
    )}`;
  }

  return await apiClient<DoctorListResponse>(
    url,
    {
      method: "GET",
    }
  );
};

// =====================================================
// Get Doctor Details
// =====================================================

export interface DoctorDetailsResponse {
  status: number;
  message: string;

  data?: Doctor;
}

export const getDoctorByIdApi = async (
  doctorId: number | string
) => {
  return await apiClient<DoctorDetailsResponse>(
    `${API_ENDPOINTS.DOCTOR.DETAILS}/${doctorId}`,
    {
      method: "GET",
    }
  );
};

// =====================================================
// Update Doctor
// =====================================================

export interface UpdateDoctorPayload {
  name: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string;
  experience: number;
  registration_no: string;
  consultation_fee: number;
  about: string;
}

export interface UpdateDoctorResponse {
  status: number;
  message: string;

  data?: {
    doctor?: Doctor;
  };
}

export const updateDoctorApi = async (
  doctorId: number | string,
  payload: UpdateDoctorPayload
) => {
  return await apiClient<UpdateDoctorResponse>(
    `${API_ENDPOINTS.DOCTOR.DETAILS}/${doctorId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

// =====================================================
// Doctor Schedule
// =====================================================

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface BackendScheduleRecord {
  id: number;
  doctor_id: number;
  day: Weekday;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_available: boolean;
}

export interface SessionItem {
  id: string;
  startTime: string;
  endTime: string;
  slot_duration?: number;
}

export interface DaySchedule {
  day: Weekday;
  enabled: boolean;
  sessions: SessionItem[];
}

export interface DoctorScheduleResponse {
  status: number;
  message: string;
  data: BackendScheduleRecord[];
}

export interface SaveWeeklySchedulePayload {
  schedule: {
    day: Weekday;
    enabled: boolean;
    sessions: {
      start_time: string;
      end_time: string;
      slot_duration?: number;
      is_available?: boolean;
    }[];
  }[];
}

export const getDoctorScheduleApi = async (
  doctorId: number | string
) => {
  return await apiClient<DoctorScheduleResponse>(
    `${API_ENDPOINTS.DOCTOR.DETAILS}/${doctorId}/schedules`,
    {
      method: "GET",
    }
  );
};

export const saveDoctorWeeklyScheduleApi = async (
  doctorId: number | string,
  payload: SaveWeeklySchedulePayload
) => {
  return await apiClient<DoctorScheduleResponse>(
    `${API_ENDPOINTS.DOCTOR.DETAILS}/${doctorId}/schedules`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

export interface TodayScheduleItem {
  id: number;
  doctor_id: number;
  day: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_available: boolean;
  doctor: {
    id: number;
    name: string;
    specialization: string;
    profile_image: string | null;
  };
}

export interface TodaySchedulesResponse {
  status: number;
  message: string;
  data: TodayScheduleItem[];
}

export const getTodaySchedulesApi = async () => {
  return await apiClient<TodaySchedulesResponse>(
    API_ENDPOINTS.SCHEDULE.TODAY,
    {
      method: "GET",
    }
  );
};

export const updateScheduleApi = async (
  scheduleId: number | string,
  payload: {
    is_available?: boolean;
    start_time?: string;
    end_time?: string;
    slot_duration?: number;
    day?: string;
  }
) => {
  return await apiClient<{ status: number; message: string; data: TodayScheduleItem }>(
    `/clinic/schedules/${scheduleId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};