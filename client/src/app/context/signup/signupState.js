"use client";

import React, { useReducer, useEffect } from "react";
import signupContext from "./signupContext";
import signupReducer from "./signupReducer";

import { SIGNUP_FETCH, RESPONSE_STATUS, CLEAR_RESPONSE } from "./signupTypes";
import { apiCall, setAuthToken } from "../../../utils/api";
import { response } from "../../../utils/common";
import { storage, session } from "../../../utils/storage";

const SignupState = (props) => {
  const initialState = {
    responseStatus: null,
    fetchUser: [],
  };

  const [state, dispatch] = useReducer(signupReducer, initialState);
  let resp = new response(dispatch, RESPONSE_STATUS);

  useEffect(() => {
    if (storage.get("token")) {
      setAuthToken(storage.get("token"));
    }
  }, []);

  useEffect(() => {
    if (storage.get("username")) {
      dispatch({
        type: "SET_USER",
        payload: {
          username: storage.get("username"),
        },
      });
    }
  }, []);

  // Register User Details
  const registerUser = async (method, endpoint, formData, fromVariable) => {
    if (storage.get("token")) {
      setAuthToken(storage.get("token"));
    } else if (session.get("token")) {
      setAuthToken(session.get("token"));
    }
    try {
      const [res] = await Promise.all([
        apiCall(method || "post", endpoint, formData, "", "auth"),
      ]);

      if (res && res.status === 200) {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "SUCCESS",
            message: "Request processed successfully!",
            type: res.status,
            data: res.data,
            from: fromVariable || "registerUser",
          },
        });
      } else {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "ERROR",
            message: "Something went wrong!",
            type: 0,
            from: fromVariable || "registerUser",
          },
        });
      }

      console.log("Success while getting ESM data");
    } catch (err) {
      await dispatch({
        type: RESPONSE_STATUS,
        payload: {
          status: "ERROR",
          message: "Something went wrong!",
          type: err.status,
          from: fromVariable || "registerUser",
        },
      });
      console.log(err, "Error while getting ESM data");
    }
  };

  // Get User Data
  const getUser = async (endpoint, payload, fromVariable) => {
    if (localStorage.username) {
      try {
        const res = await apiCall("post", endpoint, payload, "", "auth");
        console.log(res, "fetchRes");
        if (res && res.status === 200) {
          await dispatch({
            type: SIGNUP_FETCH,
            payload: {
              status: "SUCCESS",
              message: "Request processed successfully!",
              type: res.status,
              data: res.data,
              from: fromVariable || "getUser",
            },
          });
        } else {
          await dispatch({
            type: RESPONSE_STATUS,
            payload: {
              status: "ERROR",
              message: "Something went wrong!",
              type: 0,
              from: fromVariable || "getUser",
            },
          });
        }
      } catch (error) {
        // Handle any errors that occurred during the API call or dispatch
        console.error("Error while fetching service details:", error);
        await dispatch({
          type: RESPONSE_STATUS,
          payload: "Something went wrong!",
        });
      }
    }
  };

  // Update Registration ID
  const updateRegId = async (formData, fromVariable, path) => {
    try {
      const [res] = await Promise.all([
        apiCall("post", "updateRegId", formData, "", path),
      ]);
      console.log(res, "updateRegIdRes");
      if (res && res.status === 200 && res.data.message != "FAILED") {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "SUCCESS",
            message: "Request processed successfully!",
            type: res.status,
            data: res.data,
            from: fromVariable || "updateRegId",
          },
        });
      } else {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "ERROR",
            message: "Something went wrong!",
            type: 0,
            from: fromVariable || "updateRegId",
          },
        });
      }

      console.log("Success while updating Registration ID");
    } catch (err) {
      await dispatch({
        type: RESPONSE_STATUS,
        payload: {
          status: "ERROR",
          message: "Something went wrong!",
          type: err.status,
          from: fromVariable || "updateRegId",
        },
      });
      console.log(err, "Error while updating Registration ID");
    }
  };

  // Register User Details
  const finalSubmit = async (formData, fromVariable, path) => {
    try {
      const [res] = await Promise.all([
        apiCall("post", "NextStep", formData, "", path),
      ]);
      console.log(res, "finalSubmitRes");
      if (res && res.status === 200) {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "SUCCESS",
            message: "Request processed successfully!",
            type: res.status,
            data: res.data.message,
            from: fromVariable || "finalSubmit",
          },
        });
      } else {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "ERROR",
            message: "Something went wrong!",
            type: 0,
            from: fromVariable || "finalSubmit",
          },
        });
      }

      console.log("Success while doing a final submission");
    } catch (err) {
      await dispatch({
        type: RESPONSE_STATUS,
        payload: {
          status: "ERROR",
          message: "Something went wrong!",
          type: err.status,
          from: fromVariable || "finalSubmit",
        },
      });
      console.log(err, "Error while doing a final submission");
    }
  };

  // Send Message to User
  const sendMessage = async (formData, fromVariable, path) => {
    try {
      const [res] = await Promise.all([
        apiCall("post", "SendMessage", formData, "", path),
      ]);
      console.log(res, "sendMessageRes");
      if (res && res.status === 200) {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "SUCCESS",
            message: "Request processed successfully!",
            type: res.status,
            data: res.data.message,
            from: fromVariable || "sendMessage",
          },
        });
      } else {
        await dispatch({
          type: RESPONSE_STATUS,
          payload: {
            status: "ERROR",
            message: "Something went wrong!",
            type: 0,
            from: fromVariable || "sendMessage",
          },
        });
      }

      console.log("Success while doing a sending message");
    } catch (err) {
      await dispatch({
        type: RESPONSE_STATUS,
        payload: {
          status: "ERROR",
          message: "Something went wrong!",
          type: err.status,
          from: fromVariable || "sendMessage",
        },
      });
      console.log(err, "Error while sending message");
    }
  };

  // Clear Response
  const clearResponse = () =>
    dispatch({
      type: CLEAR_RESPONSE,
    });

  return (
    <signupContext.Provider
      value={{
        responseStatus: state.responseStatus,
        fetchUser: state.fetchUser,
        clearResponse,
        registerUser,
        updateRegId,
        finalSubmit,
        sendMessage,
        getUser,
      }}
    >
      {props.children}
    </signupContext.Provider>
  );
};

export default SignupState;
