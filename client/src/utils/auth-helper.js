import { storage, session } from './storage';
import { cookieUtils, COOKIE_NAMES } from './cookies';

export const isAuthenticated = () => {
  const localToken = storage.get("token");
  const sessionToken = session.get("token"); 
  const cookieToken = cookieUtils.get(COOKIE_NAMES.AUTH_TOKEN);
  
  return !!(localToken || sessionToken || cookieToken);
};

export const getAuthToken = () => {
  return storage.get("token") || 
         session.get("token")
};

export const clearAllAuthData = () => {
  storage.remove("token");
  storage.remove("username");
  storage.remove("user");
  session.remove("token");
  session.remove("username");
  session.remove("user");
  cookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
  cookieUtils.remove(COOKIE_NAMES.USER_SESSION);
}; 