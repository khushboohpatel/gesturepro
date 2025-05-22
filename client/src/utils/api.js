"use client";

import axios from "axios";

export const apiCall = async (method, endpoint, data, headertype, baseurl) => {
  let site_url = `${process.env.NEXT_PUBLIC_API_URL}/`;
  if (baseurl) {
    site_url = `${process.env.NEXT_PUBLIC_API_URL}/${baseurl}/`;
  }
  return new Promise(async (resolve, reject) => {
    let type = "";
    if (headertype && headertype === "formdata") {
      type = "multipart/form-data";
    } else {
      type = "application/json";
    }
    const config = {
      headers: {
        "content-type": type,
      },
    };
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
