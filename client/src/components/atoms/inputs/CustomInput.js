"use client";

import React from "react";
import TextField from "@mui/material/TextField";
import { v4 as uuidv4 } from "uuid";

function CustomInput({ id, variant, label, className, ...props }) {
  return (
    <div className={`customInput ${className || ""}`}>
      <TextField
        id={id || uuidv4()}
        fullWidth
        label={label}
        variant={variant || "outlined"}
        value={props.value}
        autoFocus={props.autoFocus}
        name={props.name}
        onChange={props.onChange}
        onBlur={props.onBlur}
        type={props.type}
        size={props.size}
        disabled={props.disabled}
        placeholder={props.placeholder}
        error={props.error}
        helperText={props.helperText}
        required={props.required}
        InputProps={{
          startAdornment: props.startAdornment,
          endAdornment: props.endAdornment,
        }}
        inputProps={{
          ...(props.inputProps || {}),
          shrink: props.shrink ? "true" : "false",
        }}
      />
    </div>
  );
}

export default CustomInput;
