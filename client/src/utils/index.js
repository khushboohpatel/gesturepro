"use client";

import React from "react";
import CustomCheckbox from "../components/atoms/inputs/CustomCheckbox";
import CustomRadio from "../components/atoms/inputs/CustomRadio";
import CustomSelect from "../components/atoms/inputs/CustomSelect";
import CustomTextarea from "../components/atoms/inputs/CustomTextarea";
import Uploader from "./uploader";
import CustomInput from "../components/atoms/inputs/CustomInput";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment/moment";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Checkbox, ListItemText, MenuItem } from "@mui/material";
import CustomMultiSelect from "../components/atoms/inputs/CustomMultiSelect";

const yearFormat = "YYYY";
const dateFormat = "DD-MM-YYYY";
const dateTimeFormat = "DD-MM-YYYY h:mm a";


export const converDateTime = (data) => {
  let dataReturn = null;
  if (data) {
    if (moment(data).isValid()) {
      dataReturn = `${moment(data).format(dateTimeFormat)}`;
    }
  }
  return dataReturn;
};

export const converDate = (data) => {
  let dataReturn = "";
  if (data) {
    if (moment(data).isValid()) {
      dataReturn = `${moment(data).format(dateFormat)}`;
    }
  }
  return dataReturn;
};

export const converYear = (data) => {
  let dataReturn = "";
  if (data) {
    if (moment(data).isValid()) {
      dataReturn = `${moment(data).format(yearFormat)}`;
    }
  }
  return dataReturn;
};

export const dateFormatFunction = (data) => {
  let dataReturn = "-";
  if (data) {
    if (moment(data).isValid()) {
      dataReturn = `${moment(data).format(dateFormat)}`;
    }
  }
  return dataReturn;
};

export const yearFormatFunction = (data) => {
  let dataReturn = "-";
  if (data) {
    if (moment(data).isValid()) {
      dataReturn = `${moment(data).format(yearFormat)}`;
    }
  }
  return dataReturn;
};

export const dateTimeFormatFunction = (data) => {
  let dataReturn = "-";
  if (data) {
    if (moment(data).isValid()) {
      dataReturn = `${moment(data).format(dateTimeFormat)}`;
    }
  }
  return dataReturn;
};

const helperText = (data, formik) => {
  return data.filter &&
    formik &&
    formik.touched &&
    formik.touched.filters &&
    formik.touched.filters[data.name] &&
    formik.errors &&
    formik.errors.filters &&
    formik.errors.filters[data.name]
    ? formik.errors.filters[data.name]
    : formik.touched[data.name] && formik.errors[data.name];
};

const errorCheck = (data, formik) => {
  return data.filter &&
    formik &&
    formik.touched &&
    formik.touched.filters &&
    formik.touched.filters[data.name] &&
    formik.errors &&
    formik.errors.filters &&
    formik.errors.filters[data.name]
    ? formik.errors.filters[data.name]
    : formik.touched[data.name] && formik.errors[data.name];
};

const multiSelectValue = (data, formik) => {
  return data.options
    ?.filter((d) =>
      formik.values[data.name]?.length
        ? !formik.values[data.name].includes(d.value)
        : true
    )
    .map((d) => d.value)
    .flat();
};

export const mapData = (page, props) => {
  let formik = page.formik ? page.formik : page[0].formik;
  let pageData = page.data ? page.data : page;

  let data =
    pageData &&
    pageData.map((data, index) => (
      <React.Fragment key={index}>
        <div className={data.class}>
          {data.type === "select" ? (
            <>
              <CustomSelect
                label={data.label}
                id={data.id}
                value={
                  data.filter
                    ? formik.values.filters[data.name].value
                    : formik.values[data.name]
                }
                autoFocus={data.autoFocus}
                name={data.filter ? `filters.${data.name}.value` : data.name}
                size={data.size}
                onChange={data.onChange ? data.onChange : formik.handleChange}
                placeholder={data.placeholder}
                disabled={data.disabled}
                onBlur={formik.handleBlur}
                type={data.type}
                options={data.options}
                error={errorCheck(data, formik)}
                helperText={helperText(data, formik)}
                className={data.className}
              />
            </>
          ) : data.type === "multiselect" ? (
            <>
              <CustomMultiSelect
                label={data.label}
                id={data.id}
                value={
                  data.filter
                    ? formik.values.filters[data.name].value || []
                    : formik.values[data.name] || []
                }
                autoFocus={data.autoFocus}
                name={data.filter ? `filters.${data.name}.value` : data.name}
                onChange={(event, value) => {
                  let arrayValue = event.target.value.flat();
                  let allLength = data.filter
                    ? formik.values.filters[data.name].value?.length ===
                      data.options.length
                    : formik.values[data.name]?.length === data.options?.length;
                  if (allLength && arrayValue.length === data.options.length) {
                    arrayValue = [];
                  }
                  console.log(arrayValue.join(","), "arrayValue");
                  data.filter
                    ? formik.setFieldValue(
                        `filters.${data.name}.value`,
                        arrayValue
                      )
                    : formik.setFieldValue(data.name, arrayValue);
                }}
                placeholder={data.placeholder}
                onBlur={formik.handleBlur}
                disabled={data.disabled}
                type={data.type}
                error={errorCheck(data, formik)}
                helperText={helperText(data, formik)}
                options={data.options}
                size={data.size}
              >
                <MenuItem value={multiSelectValue(data, formik)}>
                  <Checkbox
                    checked={
                      data.filter
                        ? formik.values.filters[data.name].value?.flat()
                            ?.length === data.options?.length
                        : formik.values[data.name]?.flat()?.length ===
                          data.options?.length
                    }
                    onChange={(val) => {
                      val.target.checked
                        ? data.filter
                          ? formik.setFieldValue(
                              `filters.${data.name}.value`,
                              formik.values.filters[data.name].value.concat(
                                multiSelectValue(data, formik)
                              )
                            )
                          : formik.setFieldValue(
                              data.name,
                              formik.values[data.name].concat(
                                multiSelectValue(data, formik)
                              )
                            )
                        : data.filter
                        ? formik.setFieldValue(`filters.${data.name}.value`, [])
                        : formik.setFieldValue(data.name, []);
                    }}
                  />
                  <ListItemText primary={"All"} />
                </MenuItem>
                {data.options.map((opt, optindex) => (
                  <MenuItem key={optindex} value={opt.value}>
                    <Checkbox
                      checked={
                        data.filter
                          ? formik?.values?.filters[data.name].value
                              ?.flat()
                              .indexOf(opt.value) > -1
                          : formik?.values[data.name]
                              ?.flat()
                              .indexOf(opt.value) > -1
                      }
                      onChange={
                        data.onChange ? data.onChange : formik.handleChange
                      }
                    />
                    {opt.show}
                  </MenuItem>
                ))}
              </CustomMultiSelect>
            </>
          ) : data.type === "check" ? (
            <>
              {data.options &&
                data.options.map((opt, optindex) => (
                  <CustomCheckbox
                    key={optindex}
                    name={data.name}
                    disabled={data.disabled}
                    label={opt.description}
                    checked={
                      formik.values[data.name]?.indexOf(opt.id.toString()) !== -1
                    }
                    value={opt.id.toString()}
                    onChange={formik.handleChange}
                    error={formik.touched[data.name] && formik.errors[data.name]}
                    helperText={
                      formik.errors[data.name] &&
                      formik.touched[data.name] &&
                      formik.errors[data.name]
                    }
                  />
                ))}
              {formik.touched[data.name] && formik.errors[data.name] && (
                <div className="checkboxError">
                  <p>{formik.errors[data.name]}</p>
                </div>
              )}
            </>
          ) : data.type === "date" ? (
            data.upperLabel ? (
              <DemoContainer components={["DatePicker"]}>
                <label className="datePickerLabel">{data.label}</label>
                <DatePicker
                  sx={{ margin: "0" }}
                  slotProps={{
                    field: {
                      autoOk: true,
                      showTodayButton: true,
                    },
                    textField: {
                      id: data.name,
                      name: data.name,
                      variant: "outlined",
                      placeholder: data.placeholder || "",
                      disabled: data.disabled,
                      helperText: helperText(data, formik)
                        ? helperText(data, formik)
                        : data.helperText,
                      className: "customDatepicker",
                      size: data.size,
                      error: formik.touched[data.name] && formik.errors[data.name],
                      InputProps: {
                        "aria-label": "change date",
                      },
                    },
                  }}
                  format={dateFormat}
                  disableFuture={data.disableFuture || false}
                  disablePast={data.disablePast || false}
                  maxDate={
                    data.maxDate ? moment(data.maxDate, dateFormat) : moment("01-01-2100")
                  }
                  minDate={
                    data.minDate ? moment(data.minDate, dateFormat) : moment("01-01-1900")
                  }
                  value={
                    data.filter
                      ? formik.values.filters[data.name].value
                        ? moment(
                            formik.values.filters[data.name].value,
                            dateFormat
                          )
                        : null
                      : formik.values[data.name]
                      ? moment(formik.values[data.name], dateFormat)
                      : null
                  }
                  onChange={(val) => {
                    data.filter
                      ? formik.setFieldValue(
                          `filters.${data.name}.value`,
                          converDate(val)
                        )
                      : formik.setFieldValue(data.name, converDate(val));
                  }}
                />
              </DemoContainer>
            ) : (
              <DemoContainer components={["DatePicker"]}>
                <>
                  <DatePicker
                    sx={{ margin: "0" }}
                    slotProps={{
                      field: {
                        autoOk: true,
                        showTodayButton: true,
                      },
                      textField: {
                        id: data.name,
                        name: data.name,
                        label: data.label,
                        variant: "outlined",
                        placeholder: data.placeholder || "",
                        disabled: data.disabled,
                        className: errorCheck(data, formik) ? "Mui-error" : "",
                        helperText: errorCheck(data, formik)
                          ? errorCheck(data, formik)
                          : data.helperText,
                        size: data.size,
                        InputProps: {
                          "aria-label": "change date",
                        },
                      },
                    }}
                    format={dateFormat}
                    disableFuture={data.disableFuture || false}
                    disablePast={data.disablePast || false}
                    maxDate={
                      data.maxDate ? moment(data.maxDate, dateFormat) : moment("01-01-2100")
                    }
                    maxDateMessage={
                      data.maxDateMessage ||
                      "Date should not be after maximal date"
                    }
                    minDate={
                      data.minDate ? moment(data.minDate, dateFormat) : moment("01-01-1900")
                    }
                    minDateMessage={
                      data.minDateMessage ||
                      "Date should not be before minimal date"
                    }
                    className="customDatepicker"
                    value={
                      data.filter
                        ? formik.values.filters[data.name].value
                          ? moment(
                              formik.values.filters[data.name].value,
                              dateFormat
                            )
                          : null
                        : formik.values[data.name]
                        ? moment(formik.values[data.name], dateFormat)
                        : null
                    }
                    onChange={(val) => {
                      data.filter
                        ? formik.setFieldValue(
                            `filters.${data.name}.value`,
                            converDate(val)
                          )
                        : formik.setFieldValue(data.name, converDate(val));
                    }}
                  />
                </>
              </DemoContainer>
            )
          ) : data.type === "year" ? (
            <DemoContainer components={["DatePicker"]}>
              <>
                <DatePicker
                  sx={{ margin: "0" }}
                  slotProps={{
                    field: {
                      autoOk: true,
                      showTodayButton: true,
                    },
                    textField: {
                      id: data.name,
                      name: data.name,
                      label: data.label,
                      variant: "outlined",
                      placeholder: data.placeholder || "",
                      disabled: data.disabled,
                      className: errorCheck(data, formik) ? "Mui-error" : "",
                      helperText: errorCheck(data, formik)
                        ? errorCheck(data, formik)
                        : data.helperText,
                      size: data.size,
                      InputProps: {
                        "aria-label": "change date",
                      },
                    },
                  }}
                  format={yearFormat}
                  views={["year"]}
                  openTo="year"
                  disableFuture={data.disableFuture || false}
                  disablePast={data.disablePast || false}
                  maxDate={data.maxDate ? moment(data.maxDate, yearFormat) : moment("2100")}
                  maxDateMessage={
                    data.maxDateMessage ||
                    "Date should not be after maximal date"
                  }
                  minDate={data.minDate ? moment(data.minDate, yearFormat) : moment("1900")}
                  minDateMessage={
                    data.minDateMessage ||
                    "Date should not be before minimal date"
                  }
                  className="customDatepicker"
                  value={
                    data.filter
                      ? formik.values.filters[data.name].value
                        ? moment(
                            formik.values.filters[data.name].value,
                            yearFormat
                          )
                        : null
                      : formik.values[data.name]
                      ? moment(formik.values[data.name], yearFormat)
                      : null
                  }
                  onChange={(val) => {
                    data.filter
                      ? formik.setFieldValue(
                          `filters.${data.name}.value`,
                          converYear(val)
                        )
                      : formik.setFieldValue(data.name, converYear(val));
                  }}
                />
              </>
            </DemoContainer>
          ) : data.type === "uploadDropZone" ? (
            <>
              <Uploader
                formik={formik}
                name={data.name}
                icon={data.icon}
                titleText={data.titleText}
                innerText={data.innerText}
                folder={data.folder}
                multiple={data.multiple}
                accept={data.accept}
              />
            </>
          ) : data.type === "textarea" ? (
            <>
              <CustomTextarea
                id={data.id}
                value={formik.values[data.name]}
                autoFocus={data.autoFocus}
                name={data.name}
                disabled={data.disabled}
                shrink={formik.values[data.name] && true}
                onBlur={formik.handleBlur}
                onChange={data.onChange ? data.onChange : formik.handleChange}
                label={data.label}
                placeholder={data.placeholder}
                type={data.type}
                error={formik.touched[data.name] && formik.errors[data.name]}
                helperText={
                  formik.errors[data.name] &&
                  formik.touched[data.name] &&
                  formik.errors[data.name]
                }
                className={data.className || ""}
              />
            </>
          ) : data.type === "checkbox" ? (
            <>
              <CustomCheckbox
                checked={formik.values[data.name]}
                label={data.label}
                value={true}
                disabled={data.disabled}
                onChange={() => {
                  formik.setFieldValue(data.name, !formik.values[data.name]);
                }}
                name={data.name}
                error={formik.touched[data.name] && formik.errors[data.name]}
                helperText={
                  formik.errors[data.name] &&
                  formik.touched[data.name] &&
                  formik.errors[data.name]
                }
              />
            </>
          ) : data.type === "checkboxarray" ? (
            data.item.map((d, i) => (
              <React.Fragment key={i}>
                <CustomCheckbox
                  name={data.name}
                  label={d.description}
                  checked={
                    formik.values[data.name]?.indexOf(d.id.toString()) !== -1
                  }
                  value={d.id.toString()}
                  onChange={formik.handleChange}
                  error={formik.touched[data.name] && formik.errors[data.name]}
                  helperText={
                    formik.errors[data.name] &&
                    formik.touched[data.name] &&
                    formik.errors[data.name]
                  }
                />
              </React.Fragment>
            ))
          ) : data.type === "radio" ? (
            <>
              <CustomRadio
                error={formik.touched[data.name] && formik.errors[data.name]}
                helperText={
                  formik.errors[data.name] &&
                  formik.touched[data.name] &&
                  formik.errors[data.name]
                }
                label={data.label}
                name={data.filter ? `filters.${data.name}.value` : data.name}
                options={data.options}
                value={
                  data.filter
                    ? formik.values.filters[data.name].value
                    : formik.values[data.name]
                }
                onChange={formik.handleChange}
                int={data.int}
                disabled={data.disabled}
              />
            </>
          ) : data.type === "misc" ? (
            <>{data.content}</>
          ) : (
            <>
              <CustomInput
                id={data.id}
                value={
                  data.filter
                    ? formik.values.filters[data.name].value
                    : data.value
                    ? data.value
                    : formik.values[data.name]
                }
                autoFocus={data.autoFocus}
                name={data.filter ? `filters.${data.name}.value` : data.name}
                disabled={data.disabled}
                shrink={
                  data.filter
                    ? formik.values.filters[data.name].value
                      ? true
                      : false
                    : formik.values[data.name]
                    ? true
                    : false
                }
                onBlur={formik.handleBlur}
                onChange={data.onChange ? data.onChange : formik.handleChange}
                label={data.label}
                placeholder={data.placeholder}
                type={data.type}
                size={data.size}
                startAdornment={data.startAdornment}
                endAdornment={data.endAdornment}
                error={errorCheck(data, formik)}
                helperText={data.helperText || helperText(data, formik)}
                inputStyle={data.inputStyle}
                required={data.required}
                className={data.className || ""}
                inputProps={data.inputProps}
                variant={data.variant || "outlined"}
              />
            </>
          )}
        </div>
      </React.Fragment>
    ));
  return data;
};


export const cleanDropdownData = (options, show, value) => {
  if (options && options.length) {
    let convertedData = options.map((data) => {
      let dataCleaned = {};
      dataCleaned.show = data[show];
      dataCleaned.value = data[value];
      return dataCleaned;
    });
    return convertedData;
  }
};

export const mapIdToValue = (options, name, id) => {
  if (options && options.length) {
    let convertedData = options
      ?.filter((d) => d.id == id || d.value == id)
      .map((data) => data[name])[0];

    return convertedData;
  }
};

export const capitalize = (data) => {
  let dataReturn = "-";
  if (data) {
    data = data.replace(/_/g, " ").toLowerCase();
    data.split(" ");
    if (data instanceof Array) {
      dataReturn = data
        .map((word) => {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(" ");
    } else {
      dataReturn = data.charAt(0).toUpperCase() + data.slice(1);
    }
  }
  return dataReturn;
};
