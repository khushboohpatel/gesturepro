"use client";

import { useState } from "react";
import SnackbarContext from "./snackbarContext";

const SnackbarState = (props) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'error', 'warning', 'info', 'success'
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const hideSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <SnackbarContext.Provider
      value={{
        snackbar,
        showSnackbar,
        hideSnackbar,
      }}
    >
      {props.children}
    </SnackbarContext.Provider>
  );
};

export default SnackbarState; 