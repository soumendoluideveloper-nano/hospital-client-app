/**
 * Centralized Validation Utility for CareSpot Clinic Partner App
 * Strict validation matching all project requirements and backend schemas.
 * Fully supports multi-language dynamic translations via i18n `t` helper.
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
  key: string;
}

type TranslateFn = (key: string, defaultText?: any) => string;

const resolveMsg = (
  t: TranslateFn | undefined,
  key: string,
  fallback: string
): string => {
  if (!t) return fallback;
  try {
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const translatedCommon = t(`common:${key}`);
    if (translatedCommon && translatedCommon !== `common:${key}`) return translatedCommon;
  } catch {}
  return fallback;
};

/**
 * Mobile Number:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Numeric only
 */
export const validateMobile = (phone: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    const key = "val_mobile_req";
    return { isValid: false, message: resolveMsg(t, key, "Mobile number is required"), key };
  }
  if (!/^\d+$/.test(trimmed) || trimmed.length !== 10 || !/^[6-9]\d{9}$/.test(trimmed)) {
    const key = "val_mobile_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid 10-digit mobile number"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Pincode:
 * - Exactly 6 digits
 * - Starts with 1-9
 * - Numbers only
 */
export const validatePincode = (pincode: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (pincode || "").trim();
  if (!trimmed) {
    const key = "val_pin_req";
    return { isValid: false, message: resolveMsg(t, key, "PIN code is required"), key };
  }
  if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
    const key = "val_pin_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid 6-digit PIN code"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Clinic Name:
 * - Required
 * - 3 to 100 characters
 * - Must contain letters
 * - Allows letters, numbers, spaces, and punctuation: & - . ' , ( )
 */
export const validateClinicName = (name: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    const key = "val_clinic_name_req";
    return { isValid: false, message: resolveMsg(t, key, "Clinic name is required"), key };
  }
  if (trimmed.length < 3) {
    const key = "val_clinic_name_min";
    return { isValid: false, message: resolveMsg(t, key, "Clinic name must be at least 3 characters"), key };
  }
  if (trimmed.length > 100) {
    const key = "val_clinic_name_max";
    return { isValid: false, message: resolveMsg(t, key, "Clinic name must not exceed 100 characters"), key };
  }
  if (!/^[a-zA-Z0-9\s&.\-',\(\)]+$/.test(trimmed) || !/[a-zA-Z]{2,}/.test(trimmed)) {
    const key = "val_clinic_name_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid clinic name"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Owner Name:
 * - Required
 * - 2 to 100 characters
 * - Letters, spaces, standard name punctuation only
 * - Must contain at least 2 alphabet characters (no purely numbers)
 */
export const validateOwnerName = (name: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    const key = "val_owner_name_req";
    return { isValid: false, message: resolveMsg(t, key, "Owner name is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_owner_name_min";
    return { isValid: false, message: resolveMsg(t, key, "Owner name must be at least 2 characters"), key };
  }
  if (trimmed.length > 100) {
    const key = "val_owner_name_max";
    return { isValid: false, message: resolveMsg(t, key, "Owner name must not exceed 100 characters"), key };
  }
  if (!/^[a-zA-Z\s\.\'\-]+$/.test(trimmed) || !/[a-zA-Z]{2,}/.test(trimmed)) {
    const key = "val_owner_name_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid owner name"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Referral Code:
 * - Optional
 * - Alphanumeric 4-20 chars if entered
 */
export const validateReferralCode = (code?: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (code || "").trim();
  if (!trimmed) {
    return { isValid: true, message: "", key: "" };
  }
  if (!/^[a-zA-Z0-9]{4,20}$/.test(trimmed)) {
    const key = "val_referral_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Referral code must be 4-20 alphanumeric characters"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Email:
 * - Valid standard email format (RFC compliant regex)
 * - Trimmed and normalized
 */
export const validateEmail = (email: string, required: boolean = true, t?: TranslateFn): ValidationResult => {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    if (required) {
      const key = "val_email_req";
      return { isValid: false, message: resolveMsg(t, key, "Email address is required"), key };
    }
    return { isValid: true, message: "", key: "" };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    const key = "val_email_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid email address"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Password:
 * - At least 8 characters
 * - Contains uppercase, lowercase, number, special character
 */
export const validatePassword = (password: string, t?: TranslateFn): ValidationResult => {
  const pwd = password || "";
  if (!pwd) {
    const key = "val_pwd_req";
    return { isValid: false, message: resolveMsg(t, key, "Password is required"), key };
  }
  if (pwd.length < 8) {
    const key = "val_pwd_invalid";
    return {
      isValid: false,
      message: resolveMsg(t, key, "Password must contain at least 8 characters, including uppercase, lowercase, number and special character."),
      key,
    };
  }
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    const key = "val_pwd_invalid";
    return {
      isValid: false,
      message: resolveMsg(t, key, "Password must contain at least 8 characters, including uppercase, lowercase, number and special character."),
      key,
    };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Confirm Password:
 * - Matches password exactly
 */
export const validateConfirmPassword = (password: string, confirmPassword: string, t?: TranslateFn): ValidationResult => {
  if (!confirmPassword) {
    const key = "val_pwd_req";
    return { isValid: false, message: resolveMsg(t, key, "Please confirm your password"), key };
  }
  if (password !== confirmPassword) {
    const key = "val_pwd_mismatch";
    return { isValid: false, message: resolveMsg(t, key, "Passwords do not match"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * OTP:
 * - Numeric only
 * - Exactly specified length (default 6)
 */
export const validateOtp = (otp: string, length: number = 6, t?: TranslateFn): ValidationResult => {
  const trimmed = (otp || "").trim();
  if (!trimmed) {
    const key = "val_otp_req";
    return { isValid: false, message: resolveMsg(t, key, "OTP is required"), key };
  }
  if (!/^\d+$/.test(trimmed) || trimmed.length !== length) {
    const key = "val_otp_invalid";
    return { isValid: false, message: resolveMsg(t, key, `Enter a valid ${length}-digit OTP`), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Address Line:
 * - Required
 * - Min 5 characters, max 250 characters
 */
export const validateAddress = (address: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (address || "").trim();
  if (!trimmed) {
    const key = "val_addr_req";
    return { isValid: false, message: resolveMsg(t, key, "Street address is required"), key };
  }
  if (trimmed.length < 5) {
    const key = "val_addr_min";
    return { isValid: false, message: resolveMsg(t, key, "Address must be at least 5 characters"), key };
  }
  if (trimmed.length > 250) {
    const key = "val_addr_max";
    return { isValid: false, message: resolveMsg(t, key, "Address must not exceed 250 characters"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * City:
 * - Required
 * - Min 2 chars, max 100 chars
 * - Letters and spaces only
 */
export const validateCity = (city: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (city || "").trim();
  if (!trimmed) {
    const key = "val_city_req";
    return { isValid: false, message: resolveMsg(t, key, "City is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_city_min";
    return { isValid: false, message: resolveMsg(t, key, "City must be at least 2 characters"), key };
  }
  if (trimmed.length > 100) {
    const key = "val_city_max";
    return { isValid: false, message: resolveMsg(t, key, "City must not exceed 100 characters"), key };
  }
  if (!/^[a-zA-Z\s\.\-]+$/.test(trimmed)) {
    const key = "val_city_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid city name"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * State:
 * - Required
 * - Min 2 chars, max 100 chars
 * - Letters and spaces only
 */
export const validateState = (state: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (state || "").trim();
  if (!trimmed) {
    const key = "val_state_req";
    return { isValid: false, message: resolveMsg(t, key, "State is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_state_min";
    return { isValid: false, message: resolveMsg(t, key, "State must be at least 2 characters"), key };
  }
  if (trimmed.length > 100) {
    const key = "val_state_max";
    return { isValid: false, message: resolveMsg(t, key, "State must not exceed 100 characters"), key };
  }
  if (!/^[a-zA-Z\s\.\-]+$/.test(trimmed)) {
    const key = "val_state_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid state name"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Doctor Name:
 * - Required
 * - 2 to 150 characters
 * - Letters, spaces, dots, dashes, apostrophes only
 * - Must contain at least 2 alphabet characters (strictly rejects numeric-only strings like 343434)
 */
export const validateDoctorName = (name: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    const key = "val_doc_name_req";
    return { isValid: false, message: resolveMsg(t, key, "Doctor name is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_doc_name_min";
    return { isValid: false, message: resolveMsg(t, key, "Doctor name must be at least 2 characters"), key };
  }
  if (trimmed.length > 150) {
    const key = "val_doc_name_max";
    return { isValid: false, message: resolveMsg(t, key, "Doctor name must not exceed 150 characters"), key };
  }
  if (!/^[a-zA-Z\s\.\'\,\-]+$/.test(trimmed) || !/[a-zA-Z]{2,}/.test(trimmed)) {
    const key = "val_doc_name_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid doctor name with letters"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Qualification:
 * - Required
 * - 2 to 200 chars
 * - Must contain letters
 */
export const validateQualification = (qual: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (qual || "").trim();
  if (!trimmed) {
    const key = "val_qual_req";
    return { isValid: false, message: resolveMsg(t, key, "Qualification is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_qual_min";
    return { isValid: false, message: resolveMsg(t, key, "Qualification must be at least 2 characters"), key };
  }
  if (trimmed.length > 200) {
    const key = "val_qual_max";
    return { isValid: false, message: resolveMsg(t, key, "Qualification must not exceed 200 characters"), key };
  }
  if (!/^[a-zA-Z0-9\s\.\,\(\)\/\-]+$/.test(trimmed) || !/[a-zA-Z]{2,}/.test(trimmed)) {
    const key = "val_qual_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid qualification (e.g. MBBS, MD)"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Specialization:
 * - Required
 * - 2 to 150 chars
 * - Must contain letters
 */
export const validateSpecialization = (spec: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (spec || "").trim();
  if (!trimmed) {
    const key = "val_spec_req";
    return { isValid: false, message: resolveMsg(t, key, "Specialization is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_spec_min";
    return { isValid: false, message: resolveMsg(t, key, "Specialization must be at least 2 characters"), key };
  }
  if (trimmed.length > 150) {
    const key = "val_spec_max";
    return { isValid: false, message: resolveMsg(t, key, "Specialization must not exceed 150 characters"), key };
  }
  if (!/^[a-zA-Z\s\.\,\/\-]+$/.test(trimmed) || !/[a-zA-Z]{2,}/.test(trimmed)) {
    const key = "val_spec_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid specialization (e.g. Cardiologist)"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Experience:
 * - Numeric (years)
 * - 0 to 70
 */
export const validateExperience = (exp: string | number, t?: TranslateFn): ValidationResult => {
  const str = String(exp !== undefined && exp !== null ? exp : "").trim();
  if (!str) {
    const key = "val_exp_req";
    return { isValid: false, message: resolveMsg(t, key, "Experience is required"), key };
  }
  const num = Number(str);
  if (isNaN(num) || !/^\d+$/.test(str) || num < 0 || num > 70) {
    const key = "val_exp_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter valid experience in years (0 - 70)"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Consultation Fee:
 * - Numeric
 * - Non-negative (>= 0)
 */
export const validateConsultationFee = (fee: string | number, t?: TranslateFn): ValidationResult => {
  const str = String(fee !== undefined && fee !== null ? fee : "").trim();
  if (!str) {
    const key = "val_fee_req";
    return { isValid: false, message: resolveMsg(t, key, "Consultation fee is required"), key };
  }
  const num = Number(str);
  if (isNaN(num) || num < 0) {
    const key = "val_fee_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid consultation fee"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Doctor Registration Number:
 * - Alphanumeric, max 50 chars
 */
export const validateRegistrationNo = (regNo: string, required: boolean = false, t?: TranslateFn): ValidationResult => {
  const trimmed = (regNo || "").trim();
  if (!trimmed) {
    if (required) {
      const key = "val_reg_no_req";
      return { isValid: false, message: resolveMsg(t, key, "Registration number is required"), key };
    }
    return { isValid: true, message: "", key: "" };
  }
  if (!/^[a-zA-Z0-9\-\/]+$/.test(trimmed)) {
    const key = "val_reg_no_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Registration number must be alphanumeric"), key };
  }
  if (trimmed.length > 50) {
    const key = "val_reg_no_max";
    return { isValid: false, message: resolveMsg(t, key, "Registration number must not exceed 50 characters"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * About Doctor / Clinic:
 * - Max 2000 chars
 */
export const validateAbout = (about?: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (about || "").trim();
  if (!trimmed) return { isValid: true, message: "", key: "" };
  if (trimmed.length > 2000) {
    const key = "val_about_max";
    return { isValid: false, message: resolveMsg(t, key, "About section cannot exceed 2000 characters"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Lab Test Name:
 * - Required
 * - 2 to 150 characters
 * - Must contain letters
 */
export const validateLabTestName = (name: string, t?: TranslateFn): ValidationResult => {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    const key = "val_test_name_req";
    return { isValid: false, message: resolveMsg(t, key, "Test name is required"), key };
  }
  if (trimmed.length < 2) {
    const key = "val_test_name_min";
    return { isValid: false, message: resolveMsg(t, key, "Test name must be at least 2 characters"), key };
  }
  if (trimmed.length > 150) {
    const key = "val_test_name_max";
    return { isValid: false, message: resolveMsg(t, key, "Test name must not exceed 150 characters"), key };
  }
  if (!/^[a-zA-Z0-9\s&.\-',\(\)\/]+$/.test(trimmed) || !/[a-zA-Z]{2,}/.test(trimmed)) {
    const key = "val_test_name_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid test name"), key };
  }
  return { isValid: true, message: "", key: "" };
};

/**
 * Lab Test Price:
 * - Numeric
 * - Positive (> 0)
 */
export const validateLabTestPrice = (price: string | number, t?: TranslateFn): ValidationResult => {
  const str = String(price !== undefined && price !== null ? price : "").trim();
  if (!str) {
    const key = "val_test_price_req";
    return { isValid: false, message: resolveMsg(t, key, "Test price is required"), key };
  }
  const num = Number(str);
  if (isNaN(num) || num <= 0) {
    const key = "val_test_price_invalid";
    return { isValid: false, message: resolveMsg(t, key, "Enter a valid price greater than 0"), key };
  }
  return { isValid: true, message: "", key: "" };
};

