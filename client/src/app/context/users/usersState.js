"use client";

import React, { useReducer, useEffect } from "react";
import usersContext from "./usersContext";
import usersReducer from "./usersReducer";

import { USERS_FETCH, RESPONSE_STATUS, CLEAR_RESPONSE } from "./usersTypes";
import { apiCall, setAuthToken } from "../../../utils/api";
import { response } from "../../../utils/common";
import { storage, session } from "../../../utils/storage";

const UsersState = (props) => {
  const initialState = {
    responseStatus: null,
    fetchUSERS: [],
  };

  const [state, dispatch] = useReducer(usersReducer, initialState);
  let resp = new response(dispatch, RESPONSE_STATUS);

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

  const updateUser = async (formData) => {
    try {
      const [res] = await Promise.all([
        apiCall("put", "updateProfile", formData, "", "Admin"),
      ]);
      resp.commonResponse(res.data, "updateUser");
      console.log(res, "checkResData");
    } catch (err) {
      resp.commonErrorResponse("updateUser");
    }
  };

  // Get Users Data
  const getUsers = async (method, endpoint, payload, fromVariable, path) => {
    console.log(
      "Getting users",
      storage.get("username") || session.get("username"),
      method,
      endpoint,
      payload,
      "",
      path
    );
    if (storage.get("username") || session.get("username")) {
      try {
        const res = await apiCall(
          method,
          endpoint,
          payload,
          fromVariable || "",
          path
        );
        console.log(res, "fetchRes");
        if (res && res.status === 200) {
          await dispatch({
            type: USERS_FETCH,
            payload: {
              status: "SUCCESS",
              message: "Request processed successfully!",
              type: res.status,
              data: res.data,
              from: fromVariable || "getUsers",
            },
          });
        } else {
          await dispatch({
            type: RESPONSE_STATUS,
            payload: {
              status: "ERROR",
              message: "Something went wrong!",
              type: 0,
              from: fromVariable || "getUsers",
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

  // Clear Response
  const clearResponse = () =>
    dispatch({
      type: CLEAR_RESPONSE,
    });

  return (
    <usersContext.Provider
      value={{
        responseStatus: state.responseStatus,
        fetchUSERS: state.fetchUSERS,
        clearResponse,
        getUsers,
        updateUser,
      }}
    >
      {props.children}
    </usersContext.Provider>
  );
};

export default UsersState;
