"use client";

import React, { useReducer, useEffect } from "react";
import AuthContext from "./authContext";
import AuthReducer from "./authReducer";
import { response } from "../../../utils/common";
import {
  USER_LOADED,
  LOGOUT,
  RESPONSE_STATUS,
  CLEAR_RESPONSE,
} from "./authTypes";
import { apiCall, setAuthToken } from "../../../utils/api";
import { storage, session } from "../../../utils/storage";

export const AuthState = (props) => {
  const initialState = {
    token: storage.get("token") || session.get("token"),
    isAuthenticated: null,
    loading: true,
    user: null,
    responseStatus: null,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);
  let resp = new response(dispatch, RESPONSE_STATUS);

  // Register User
  const register = async (formData) => {
    try {
      const [res] = await Promise.all([
        apiCall("post", "register", formData, "", "auth"),
      ]);
      resp.commonResponse(res, "register", res?.response?.data?.detail);
    } catch (err) {
      resp.commonErrorResponse("register", res?.response?.data?.detail);
    }
  };

  // Login User
  const login = async (formData) => {
    try {
      const res = await apiCall("post", "login", formData, "", "auth");
      dispatch({
        type: USER_LOADED,
        payload: res.data,
      });
      if (global.session) {
        session.set("token", res.data.access_token);
      } else {
        storage.set("token", res.data.access_token);
      }
      resp.commonResponse(res, "login", "Logged in successfully!");

      // loadUser();
    } catch (err) {
      dispatch({
        type: LOGOUT,
        payload: err.response?.data?.msg || "Login failed",
      });
      resp.commonErrorResponse("login", "Something went wrong!");
    }
  };

  // Log out
  const logout = () => {
    dispatch({ type: LOGOUT });
  };

  // Clear Response
  const clearResponse = () =>
    dispatch({
      type: CLEAR_RESPONSE,
    });

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  useEffect(() => {
    if (storage.get("token")) {
      setAuthToken(storage.get("token"));
    }
  }, []);

  console.log(state, "checkState");

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        responseStatus: state.responseStatus,
        error: state.error,
        register,
        login,
        logout,
        clearResponse,
        clearError,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
