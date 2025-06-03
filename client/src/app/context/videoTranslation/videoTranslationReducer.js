"use client";

import {
  VIDEO_WORD_TOKENS,
  RESPONSE_STATUS,
  CLEAR_RESPONSE,
  CALL_END,
} from "./videoTranslationTypes";

export default (state, action) => {
  switch (action.type) {
    case VIDEO_WORD_TOKENS:
      return {
        ...state,
        videoTranscript: action?.payload,
      };
    case RESPONSE_STATUS:
      return {
        ...state,
        responseStatus: action?.payload,
      };
    case CALL_END:
      return {
        ...state,
        callEnd: action?.payload,
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
