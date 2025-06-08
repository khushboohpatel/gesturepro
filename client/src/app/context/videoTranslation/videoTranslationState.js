"use client";

import React, { useReducer } from "react";
import VideoTranslationContext from "./videoTranslationContext";
import VideoTranslationReducer from "./videoTranslationReducer";
import { response } from "../../../utils/common";
import {
  VIDEO_WORD_TOKENS,
  RESPONSE_STATUS,
  CLEAR_RESPONSE,
} from "./videoTranslationTypes";
import { apiCall } from "../../../utils/api";

export const VideoTranslationState = (props) => {
  const initialState = {
    videoTranscript: null,
    responseStatus: null,
  };

  const [state, dispatch] = useReducer(VideoTranslationReducer, initialState);
  let resp = new response(dispatch, RESPONSE_STATUS);

  const startPredictingWordTokens = async (formData, sessionId) => {
    try {
      const headers = {};
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const res = await apiCall("post", "predict-stream", formData, "formdata", "api/sign", headers);
      
      // Debug logging
      console.log("API Response:", res);
      console.log("API Response Data:", res.data);
      
      // Handle API response structure - check if it's successful or error
      let responseData = null;
      if (res.data && res.data.success) {
        // Success case - extract the data
        responseData = res.data.data;
      } else if (res.response && res.response.data) {
        // Error case - handle error response
        console.error("API Error Response:", res.response.data);
        resp.commonErrorResponse(
          "startPredictingWordTokens",
          res.response.data.detail || "API request failed"
        );
        return;
      }
      
      dispatch({
        type: VIDEO_WORD_TOKENS,
        payload: responseData,
      });

      resp.commonResponse(
        res,
        "startPredictingWordTokens",
        res?.response?.data?.detail
      );
    } catch (err) {
      console.error("API Error:", err);
      resp.commonErrorResponse(
        "startPredictingWordTokens",
        err?.response?.data?.detail || "Network error occurred"
      );
    }
  };

  const endPredictingWordTokens = async (sessionId) => {
    try {
      // Clear the session sentence when ending prediction
      console.log(sessionId, 'checksessionId')
      if (sessionId) {
        await apiCall("delete", `sentence/${sessionId}`, {}, "", "api/sign");
      }

      resp.commonResponse(
        { data: { success: true } },
        "endPredictingWordTokens"
      );
    } catch (err) {
      resp.commonErrorResponse(
        "endPredictingWordTokens",
        err?.response?.data?.detail || "Failed to end prediction session"
      );
    }
  };

  const clearSessionSentence = async (sessionId) => {
    try {
      if (sessionId) {
        await apiCall("delete", `sentence/${sessionId}`, {}, "", "api/sign");
      }
    } catch (err) {
      console.error("Failed to clear session sentence:", err);
    }
  };

  // Clear Response
  const clearResponse = () =>
    dispatch({
      type: CLEAR_RESPONSE,
    });

  return (
    <VideoTranslationContext.Provider
      value={{
        videoTranscript: state.videoTranscript,
        responseStatus: state.responseStatus,
        startPredictingWordTokens,
        endPredictingWordTokens,
        clearSessionSentence,
        clearResponse,
      }}
    >
      {props.children}
    </VideoTranslationContext.Provider>
  );
};

export default VideoTranslationState;
