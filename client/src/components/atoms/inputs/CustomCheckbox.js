"use client";

import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormHelperText from "@mui/material/FormHelperText";

function CustomCheckbox(props) {
  return (
    <FormGroup>
      <FormControlLabel 
        control={
          <Checkbox 
            checked={props.checked}
            onChange={props.onChange}
            value={props.value}
            disabled={props.disabled}
            name={props.name}
          />
        } 
        label={props.label} 
      />
      {props.error && (
        <FormHelperText className="Mui-error">{props.helperText}</FormHelperText>
      )}
    </FormGroup>
  );
}

export default CustomCheckbox;
