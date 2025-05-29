import Cookies from 'js-cookie';

export const isBrowser = typeof window !== "undefined";

export const cookieUtils = {
  set: (name, value, options = {}) => {
    if (!isBrowser) return;
    
    const defaultOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: 7, // 7 days default
      ...options
    };
    
    Cookies.set(name, value, defaultOptions);
  },

  get: (name) => {
    if (!isBrowser) return null;
    return Cookies.get(name) || null;
  },

  remove: (name, options = {}) => {
    if (!isBrowser) return;
    
    const defaultOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...options
    };
    
    Cookies.remove(name, defaultOptions);
  },

  parseFromRequest: (req) => {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name) {
        cookies[name] = rest.join('=');
      }
    });
    
    return cookies;
  }
};

export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
  USER_SESSION: 'user_session'
}; 