"use client";

import React from "react";
import TextField from "@mui/material/TextField";
import { v4 as uuidv4 } from "uuid";

function CustomTextarea({ id, variant, className, label, ...props }) {
  const shrink = props.shrink ? props.shrink.toString() : "false";
  
  return (
    <div className={`customTextarea ${className || ""}`}>
      <TextField
        multiline
        minRows={2}
        maxRows={4}
        id={id || uuidv4()}
        fullWidth
        label={label}
        variant={variant || "outlined"}
        value={props.value}
        autoFocus={props.autoFocus}
        name={props.name}
        onChange={props.onChange}
        onBlur={props.onBlur}
        disabled={props.disabled}
        placeholder={props.placeholder}
        error={props.error}
        helperText={props.helperText}
        required={props.required}
        slotProps={{
          input: {
            shrink,
          },
        }}
      />
    </div>
  );
}

export default CustomTextarea;
