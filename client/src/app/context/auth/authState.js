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
import { cookieUtils, COOKIE_NAMES } from "../../../utils/cookies";
import { signOut } from "next-auth/react";

export const AuthState = (props) => {
  const existingToken = storage.get("token") || session.get("token");

  const initialState = {
    token: existingToken,
    isAuthenticated: !!existingToken,
    loading: true,
    user: null,
    responseStatus: null,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);
  let resp = new response(dispatch, RESPONSE_STATUS);

  const setTokenEverywhere = (token) => {
    if (global.session) {
      session.set("token", token);
    } else {
      storage.set("token", token);
    }
    cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  };

  const removeTokenEverywhere = () => {
    storage.remove("token");
    session.remove("token");
    cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);

    storage.remove("username");
    storage.remove("user");
    session.remove("username");
    session.remove("user");
    cookieUtils.remove(COOKIE_NAMES.USER_SESSION);

    setAuthToken(null);
  };

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

      setTokenEverywhere(res.data.access_token);
      setAuthToken(res.data.access_token);
      resp.commonResponse(res, "login", "Logged in successfully!");
      await getUser();
    } catch (err) {
      dispatch({
        type: LOGOUT,
        payload: err.response?.data?.msg || "Login failed",
      });
      resp.commonErrorResponse("login", "Something went wrong!");
    }
  };

  // Log out
  const logout = async () => {
    dispatch({ type: LOGOUT });

    const hasNextAuthSession = !!storage.get("next-auth.session-token") ||
      !!cookieUtils.get("next-auth.session-token") ||
      !!cookieUtils.get("__Secure-next-auth.session-token");

    try {
      if (hasNextAuthSession) {
        removeTokenEverywhere();
        await signOut({ callbackUrl: "/signin" });
        return;
      } else {
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error('Error during NextAuth signOut:', error);
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during Next.js logout:', error);
    }

    removeTokenEverywhere();

    await new Promise(resolve => setTimeout(resolve, 100));

    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  };

  // Get User
  const getUser = async () => {
    try {
      const res = await apiCall("get", "get-user", "", "", "auth");
      dispatch({
        type: USER_LOADED,
        payload: res
      });

      resp.commonResponse(res, "getUser", "User fetched successfully!");

    } catch (err) {
      resp.commonErrorResponse("getUser", "Something went wrong!");
    }
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
    const token = storage.get("token") || session.get("token");
    if (token) {
      setAuthToken(token);
      if (!state.user) {
        getUser();
      }
    }
  }, []);

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
        getUser,
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
