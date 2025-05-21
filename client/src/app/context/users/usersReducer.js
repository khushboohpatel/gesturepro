"use client";

import { USERS_FETCH, RESPONSE_STATUS, CLEAR_RESPONSE } from "./usersTypes";

export default (state, action) => {
  console.log(state, action, "checkStateActionUSERS");
  switch (action.type) {
    case USERS_FETCH:
      return {
        ...state,
        fetchUSERS: action.payload,
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
