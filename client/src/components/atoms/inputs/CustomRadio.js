"use client";

import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";

const CustomRadio = (props) => {
  return (
    <div className="customRadio">
      <h6 className="radioTitle">{props.label}</h6>
      <RadioGroup
        aria-label={props.name}
        name={props.name}
        value={props.int === 1 ? parseInt(props.value) : props.value}
        onChange={props.onChange}
      >
        {props.options.map((d, i) => (
          <FormControlLabel
            key={i}
            value={props.int === 1 ? parseInt(d.id) : d.id}
            className={
              props.value && props.value == d.id ? "checked" : "unChecked"
            }
            control={
              <Radio
                disabled={props.disabled ? props.disabled : false}
                sx={{
                  color: 'var(--primColor)',
                  '&.Mui-checked': {
                    color: 'var(--primColor)',
                  },
                }}
              />
            }
            label={d.show}
          />
        ))}
      </RadioGroup>
      <FormHelperText className="Mui-error">{props.error}</FormHelperText>
    </div>
  );
};

export default CustomRadio;
