"use client";

import { useContext, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import AlertContext from "@/app/context/alert/alertContext";
import SnackbarContext from "@/app/context/snackbar/snackbarContext";

const Alerts = () => {
  const alertContext = useContext(AlertContext);
  const { alerts, clearAlert } = alertContext;
  const { snackbar, showSnackbar, hideSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    if (alerts.length > 0) {
      const alert = alerts[0];
      showSnackbar(alert.msg, alert.type);
      clearAlert(alert.id);
    }
  }, [alerts, clearAlert, showSnackbar]);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default Alerts;
