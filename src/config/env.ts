// ipconfig getifaddr en0 
const ENV = {
  DEV: {
    API_BASE_URL: "http://192.168.0.103:8000/api",
    FILE_BASE_URL: "http://192.168.0.103:8000",
    // API_BASE_URL: "https://api.demo.carespot.in/api",
    // FILE_BASE_URL: "https://api.demo.carespot.in",
  },

  PROD: {
    API_BASE_URL: "https://api.demo.carespot.in/api",
    FILE_BASE_URL: "https://api.demo.carespot.in",
  },
};

export const API_BASE_URL = __DEV__
  ? ENV.DEV.API_BASE_URL
  : ENV.PROD.API_BASE_URL;

export const FILE_BASE_URL = __DEV__
  ? ENV.DEV.FILE_BASE_URL
  : ENV.PROD.FILE_BASE_URL;