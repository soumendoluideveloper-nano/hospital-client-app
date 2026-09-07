import { API_ENDPOINTS } from "../../../config/apiEndpoints";
import { apiClient } from "../../../services/api";

export interface DashboardData {
  total_doctors: number;
  todays_schedule: number;
  todays_patients: number;
  profile_views: number;
  has_lab?: boolean;
}

export interface DashboardResponse {
  status: number;
  message: string;
  data: DashboardData;
}

export const getDashboardApi = async () => {
  return await apiClient<DashboardResponse>(API_ENDPOINTS.DASHBOARD.SUMMARY, {
    method: "GET",
  });
};
