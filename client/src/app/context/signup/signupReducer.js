"use client";

import { SIGNUP_FETCH, RESPONSE_STATUS, CLEAR_RESPONSE } from "./signupTypes";

export default (state, action) => {
  switch (action.type) {
    case SIGNUP_FETCH:
      return {
        ...state,
        fetchUser: action.payload,
      };
    case RESPONSE_STATUS:
      return {
        ...state,
        responseStatus: action.payload,
      };
    case CLEAR_RESPONSE:
      return {
        ...state,
        responseStatus: "",
      };
    default:
      return state;
  }
};
