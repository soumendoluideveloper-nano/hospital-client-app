import { useReducer, useCallback } from "react";

export interface SignupFormState {
  // Step 1
  mobile: string;
  otp: string;
  otpSent: boolean;
  otpVerified: boolean;

  // Step 2
  clinicName: string;
  ownerName: string;
  referralCode: string;

  // Step 3
  address: string;
  city: string;
  stateName: string;
  pincode: string;

  // Step 4
  email: string;
  password: string;
  confirmPassword: string;

  showPassword: boolean;
  showConfirmPassword: boolean;
}

const initialState: SignupFormState = {
  mobile: "",
  otp: "",
  otpSent: false,
  otpVerified: false,

  clinicName: "",
  ownerName: "",
  referralCode: "",

  address: "",
  city: "",
  stateName: "",
  pincode: "",

  email: "",
  password: "",
  confirmPassword: "",

  showPassword: false,
  showConfirmPassword: false,
};

type Action =
  | {
      type: "UPDATE_FIELD";
      field: keyof SignupFormState;
      value: any;
    }
  | {
      type: "RESET";
    };

function reducer(
  state: SignupFormState,
  action: Action
): SignupFormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export default function useSignupForm() {
  const [form, dispatch] = useReducer(
    reducer,
    initialState
  );

  const updateField = useCallback(
    <K extends keyof SignupFormState>(
      field: K,
      value: SignupFormState[K]
    ) => {
      dispatch({
        type: "UPDATE_FIELD",
        field,
        value,
      });
    },
    []
  );

  const resetForm = useCallback(() => {
    dispatch({
      type: "RESET",
    });
  }, []);

  return {
    form,
    updateField,
    resetForm,
  };
}