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

  const startPredictingWordTokens = async (formData) => {
    try {
      const res = await apiCall("post", "predict_frame", formData, "formdata", "video");
      
      // Debug logging
      console.log("API Response:", res);
      console.log("API Response Data:", res.data);
      
      dispatch({
        type: VIDEO_WORD_TOKENS,
        payload: res.data,
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
        err?.response?.data?.detail
      );
    }
  };

  const endPredictingWordTokens = async (formData) => {
    try {
      const res = await apiCall("get", "reset_capture", {}, "", "video");

      resp.commonResponse(
        res,
        "endPredictingWordTokens",
        res?.response?.data?.detail
      );
    } catch (err) {
      resp.commonErrorResponse(
        "endPredictingWordTokens",
        res?.response?.data?.detail
      );
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
        clearResponse,
      }}
    >
      {props.children}
    </VideoTranslationContext.Provider>
  );
};

export default VideoTranslationState;
