export const API_ENDPOINTS = {
  AUTH: {
    CLINIC: {
      SEND_OTP: "/auth/clinic/send-otp",
      VERIFY_OTP: "/auth/clinic/verify-otp",
      SIGNUP: "/auth/clinic/complete-profile",
      LOGIN: "/auth/clinic/login",
      PROFILE: "/auth/clinic/profile",

      CHANGE_PASSWORD: "/clinic/change-password",
      UPDATE_PROFILE: "/clinic/profile",  
    },
  },

  DOCTOR: {
    LIST: "/clinic/doctors",
    CREATE: "/clinic/doctors",
    DETAILS: "/clinic/doctors",
    UPDATE: "/clinic/doctors",
  },

  SCHEDULE: {
    TODAY: "/clinic/schedules/today",
  },

  APPOINTMENT: {
    LIST: "/clinic/appointments",
    TODAY: "/clinic/appointments",
  },

  DASHBOARD: {
    SUMMARY: "/clinic/dashboard",
  },

  ENQUIRY: {
    LIST: "/clinic/enquiries",
    DETAILS: (id: number | string) => `/clinic/enquiries/${id}`,
    ACCEPT: (id: number | string) => `/clinic/enquiries/${id}/accept`,
    CANCEL: (id: number | string) => `/clinic/enquiries/${id}/cancel`,
    STATUS: (id: number | string) => `/clinic/enquiries/${id}/status`,
  },

  LAB: {
    MY_TESTS: "/lab/tests/my",
    TESTS: "/lab/tests",
    BOOKINGS: "/lab/bookings",
    REPORTS: "/lab/reports",
  },
} as const;