import { useReducer, useCallback } from "react";

export interface SignupFormData {
  // Step 1
  mobile: string;
  otp: string;
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
}

const initialState: SignupFormData = {
  mobile: "",
  otp: "",
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
};

type Action =
  | {
      type: "STEP_ONE";
      payload: {
        mobile: string;
        otp: string;
        otpVerified: boolean;
      };
    }
  | {
      type: "STEP_TWO";
      payload: {
        clinicName: string;
        ownerName: string;
        referralCode: string;
      };
    }
  | {
      type: "STEP_THREE";
      payload: {
        address: string;
        city: string;
        stateName: string;
        pincode: string;
      };
    }
  | {
      type: "STEP_FOUR";
      payload: {
        email: string;
        password: string;
      };
    }
  | {
      type: "RESET";
    };

function reducer(
  state: SignupFormData,
  action: Action
): SignupFormData {
  switch (action.type) {
    case "STEP_ONE":
      return {
        ...state,
        ...action.payload,
      };

    case "STEP_TWO":
      return {
        ...state,
        ...action.payload,
      };

    case "STEP_THREE":
      return {
        ...state,
        ...action.payload,
      };

    case "STEP_FOUR":
      return {
        ...state,
        ...action.payload,
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

  const saveStepOne = useCallback(
    (
      mobile: string,
      otp: string,
      otpVerified: boolean
    ) => {
      dispatch({
        type: "STEP_ONE",
        payload: {
          mobile,
          otp,
          otpVerified,
        },
      });
    },
    []
  );

  const saveStepTwo = useCallback(
    (
      clinicName: string,
      ownerName: string,
      referralCode: string
    ) => {
      dispatch({
        type: "STEP_TWO",
        payload: {
          clinicName,
          ownerName,
          referralCode,
        },
      });
    },
    []
  );

  const saveStepThree = useCallback(
    (
      address: string,
      city: string,
      stateName: string,
      pincode: string
    ) => {
      dispatch({
        type: "STEP_THREE",
        payload: {
          address,
          city,
          stateName,
          pincode,
        },
      });
    },
    []
  );

  const saveStepFour = useCallback(
    (
      email: string,
      password: string
    ) => {
      dispatch({
        type: "STEP_FOUR",
        payload: {
          email,
          password,
        },
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

    saveStepOne,
    saveStepTwo,
    saveStepThree,
    saveStepFour,

    resetForm,
  };
}