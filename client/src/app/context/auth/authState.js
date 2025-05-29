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
  // Check for existing token from storage only (not cookies for client-side state)
  // Cookies are primarily for server-side middleware detection
  const existingToken = storage.get("token") || session.get("token");
  
  const initialState = {
    token: existingToken,
    isAuthenticated: !!existingToken, // Set to true if any token exists
    loading: true,
    user: null,
    responseStatus: null,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);
  let resp = new response(dispatch, RESPONSE_STATUS);

  // Helper function to set token in all storage methods
  const setTokenEverywhere = (token) => {
    if (global.session) {
      session.set("token", token);
    } else {
      storage.set("token", token);
    }
    // Also store in cookie for middleware access
    cookieUtils.set(COOKIE_NAMES.AUTH_TOKEN, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  };

  // Helper function to remove token from all storage methods
  const removeTokenEverywhere = () => {
    // Clear tokens from all storage methods
    storage.remove("token");
    session.remove("token");
    cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
    
    // Clear other auth-related data
    storage.remove("username");
    storage.remove("user");
    session.remove("username");
    session.remove("user");
    cookieUtils.remove(COOKIE_NAMES.USER_SESSION);
    
    // Clear axios default headers
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
      
      // Store token in all storage methods
      setTokenEverywhere(res.data.access_token);
      
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
  const logout = async () => {
    // 1. Update auth state FIRST to immediately show user as logged out
    dispatch({ type: LOGOUT });
    
    // Check if user has NextAuth session (Google OAuth)
    const hasNextAuthSession = !!storage.get("next-auth.session-token") || 
                               !!cookieUtils.get("next-auth.session-token") ||
                               !!cookieUtils.get("__Secure-next-auth.session-token");
    
    // 2. Clear NextAuth session and cookies
    try {
      if (hasNextAuthSession) {
        // For Google OAuth users, clear storage first, then redirect
        removeTokenEverywhere();
        await signOut({ callbackUrl: "/signin" });
        return;
      } else {
        // For regular users, just clear NextAuth without redirect
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error('Error during NextAuth signOut:', error);
    }
    
    // 3. Clear cookies via Next.js API route
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during Next.js logout:', error);
    }
    
    // 4. Clear client-side storage
    removeTokenEverywhere();
    
    // 5. Small delay to ensure React state updates before redirect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 6. Redirect to signin for regular users
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
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
