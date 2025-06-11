"use client";

import axios from "axios";

export const apiCall = async (
  method,
  endpoint,
  data,
  headertype,
  baseurl,
  customHeaders = {}
) => {
  let site_url = `${process.env.NEXT_PUBLIC_API_URL}/`;
  if (baseurl) {
    site_url = `${process.env.NEXT_PUBLIC_API_URL}/${baseurl}/`;
  }
  return new Promise(async (resolve, reject) => {
    const config = {
      headers: {
        ...customHeaders,
      },
    };

    // For FormData, don't set Content-Type - let axios handle it automatically
    if (headertype && headertype === "formdata") {
      // Don't set Content-Type for FormData - axios will set it with proper boundary
    } else {
      config.headers["content-type"] = "application/json";
    }

    switch (method) {
      case "post":
        try {
          data = data ? data : {};
          const res = await axios.post(`${site_url}${endpoint}`, data, config);
          console.log("responsode from api", res);
          resolve(res);
          break;
        } catch (err) {
          console.log("responsode error from api", err);
          resolve(err);
          break;
        }
      case "put":
        try {
          data = data ? data : {};
          const res = await axios.put(`${site_url}${endpoint}`, data, config);
          console.log("responsode from api", res);
          resolve(res);
          break;
        } catch (err) {
          console.log("responsode error from api", err);
          resolve(err);
          break;
        }
      case "delete":
        try {
          console.log("delete method", endpoint, config);
          const res = await axios.delete(`${site_url}${endpoint}`, config);
          console.log("response get ode from api", res);
          resolve(res);
          break;
        } catch (err) {
          console.log("responsode error from api", err);
          resolve(err);
          break;
        }
      case "get":
        try {
          console.log("get method", endpoint, config);
          const res = await axios.get(`${site_url}${endpoint}`, config);
          console.log("response get ode from api", res);
          resolve(res);
          break;
        } catch (err) {
          console.log("responsode error from api", err);
          resolve(err);
          break;
        }
      default:
        return null;
    }
  });
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["authorization"];
  }
};
