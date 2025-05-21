"use client";

import {
  USER_LOADED,
  LOGOUT,
  COUNT_LOADED,
  RESPONSE_STATUS,
  CLEAR_RESPONSE,
  CALL_END,
} from "./authTypes";
import { storage } from "../../../utils/storage";

export default (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.data,
      };
    case COUNT_LOADED:
      return {
        ...state,
        cartCount: action.payload,
      };
    case LOGOUT:
      storage.remove("token");
      storage.remove("username");
      return {
        ...state,
        token: null,
        isAdmin: false,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: null,
      };
    case RESPONSE_STATUS:
      return {
        ...state,
        responseStatus: action.payload,
      };
    case CALL_END:
      return {
        ...state,
        callEnd: action.payload,
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
