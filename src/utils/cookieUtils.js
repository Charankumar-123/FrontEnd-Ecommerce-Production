/**
 * Utility functions for managing browser cookies
 */

export const setCookie = (name, value, days = 7) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const serialized = typeof value === "object" ? JSON.stringify(value) : String(value);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(serialized)}${expires}; path=/; SameSite=Lax`;
};

export const getCookie = (name) => {
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      const val = decodeURIComponent(c.substring(nameEQ.length));
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

// Convenience helpers for Auth Token & User
export const setAuthToken = (token, days = 7) => {
  setCookie("authToken", token, days);
};

export const getAuthToken = () => {
  const token = getCookie("authToken");
  return typeof token === "string" ? token : (token ? String(token) : null);
};

export const removeAuthToken = () => {
  deleteCookie("authToken");
};

export const setStoredUser = (user, days = 7) => {
  setCookie("user", user, days);
};

export const getStoredUser = () => {
  const user = getCookie("user");
  if (!user) return null;
  return typeof user === "object" ? user : null;
};

export const removeStoredUser = () => {
  deleteCookie("user");
};

