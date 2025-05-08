"use client";

import React from "react";
import { Button } from "@mui/material";

function CustomButton({
  variant,
  onClick,
  type,
  label,
  className,
  buttonType,
  disabled,
  startIcon,
  endIcon,
  size
}) {
  const buttonTypeClass =
    buttonType === "tertiary"
      ? "tertButton"
      : buttonType === "secondary"
      ? "secButton"
      : "primButton";
  return (
    <Button
      disabled={disabled}
      className={className + " " + "customButton " + buttonTypeClass + " " + size}
      variant={variant || "contained"}
      onClick={onClick}
      type={type}
      startIcon={startIcon}
      endIcon={endIcon}
    >
      {label}
    </Button>
  );
}

export default CustomButton;
