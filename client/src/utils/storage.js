export const isBrowser = typeof window !== "undefined";

export const storage = {
  get: (key) => {
    if (isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  },
  set: (key, value) => {
    if (isBrowser) {
      localStorage.setItem(key, value);
    }
  },
  remove: (key) => {
    if (isBrowser) {
      localStorage.removeItem(key);
    }
  },
  clear: () => {
    if (isBrowser) {
      localStorage.clear();
    }
  }
};

export const session = {
  get: (key) => {
    if (isBrowser) {
      return sessionStorage.getItem(key);
    }
    return null;
  },
  set: (key, value) => {
    if (isBrowser) {
      sessionStorage.setItem(key, value);
    }
  },
  remove: (key) => {
    if (isBrowser) {
      sessionStorage.removeItem(key);
    }
  },
  clear: () => {
    if (isBrowser) {
      sessionStorage.clear();
    }
  }
}; 