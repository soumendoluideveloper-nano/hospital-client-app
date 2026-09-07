export interface PatientInfo {
  id: number;
  name: string;
  phone: string;
  email?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string;
  blood_group?: string;
  city?: string;
  address?: string;
  profile_image?: string;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_available: boolean;
}

export interface DoctorInfo {
  id: number;
  name: string;
  specialization?: string;
  qualification?: string;
  experience?: number | string;
  consultation_fee?: number | string;
  profile_image?: string;
  schedules?: DoctorSchedule[];
}

export type EnquiryStatus =
  | "Pending"
  | "Accepted"
  | "Confirmed"
  | "Cancelled"
  | "Contacted"
  | "Follow Up"
  | "Closed";

export interface EnquiryItem {
  id: number;
  patient_id: number;
  clinic_id: number;
  doctor_id?: number | null;
  appointment_date?: string;
  appointment_time?: string;
  slot?: string;
  message: string;
  reply?: string | null;
  status: EnquiryStatus;
  created_at: string;
  patient?: PatientInfo;
  doctor?: DoctorInfo;
}

export interface AppointmentInfo {
  id: number;
  patient_id: number;
  clinic_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Rejected";
  reason?: string;
  notes?: string;
  created_at?: string;
}

export interface EnquiryDetailsResponse {
  enquiry: EnquiryItem;
  appointment?: AppointmentInfo | null;
}
