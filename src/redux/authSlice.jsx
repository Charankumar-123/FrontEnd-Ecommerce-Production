import { createSlice } from "@reduxjs/toolkit";
import { login as loginService } from "../Services/UserService";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from "../utils/cookieUtils";

// Read auth token from cookies (with localStorage fallback for existing sessions)
const savedToken = getAuthToken() || localStorage.getItem("authToken");
const savedCookieUser = getStoredUser();
const savedUserStr = !savedCookieUser ? localStorage.getItem("user") : null;

let initialUserDetail = {
  userId: "",
  userID: "",
  userName: "",
  name: "",
  email: "",
  mobile: "",
  role: "",
};

if (savedCookieUser) {
  const resolvedId = savedCookieUser.userID || savedCookieUser.userId || "";
  const resolvedName = savedCookieUser.userName || savedCookieUser.name || "";
  initialUserDetail = {
    userId: resolvedId,
    userID: resolvedId,
    userName: resolvedName,
    name: resolvedName,
    email: savedCookieUser.email || "",
    mobile: savedCookieUser.mobile || "",
    role: savedCookieUser.role || "user",
  };
} else if (savedUserStr) {
  try {
    const parsed = JSON.parse(savedUserStr);
    const resolvedId = parsed.userID || parsed.userId || "";
    const resolvedName = parsed.userName || parsed.name || "";
    initialUserDetail = {
      userId: resolvedId,
      userID: resolvedId,
      userName: resolvedName,
      name: resolvedName,
      email: parsed.email || "",
      mobile: parsed.mobile || "",
      role: parsed.role || "user",
    };
  } catch (e) {
    console.error("Failed to parse saved user", e);
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLogin: Boolean(savedToken),
    token: savedToken || null,
    userDetail: initialUserDetail,
  },
  reducers: {
    loginR: (state, action) => {
      const p = action.payload || {};
      state.isLogin = true; 
      if (p.token) {
        state.token = p.token;
        setAuthToken(p.token); // Store token in cookie
        localStorage.setItem("authToken", p.token);
      }
      const resolvedId = p.userID !== undefined ? p.userID : (p.userId !== undefined ? p.userId : state.userDetail.userId);
      const resolvedName = p.userName || p.name || state.userDetail.userName || state.userDetail.name || "";
      const resolvedEmail = p.email || state.userDetail.email || "";
      const resolvedMobile = p.mobile || state.userDetail.mobile || "";
      const resolvedRole = (p.role || state.userDetail.role || "user").toLowerCase();

      state.userDetail = {
        userId: resolvedId,
        userID: resolvedId,
        userName: resolvedName,
        name: resolvedName,
        email: resolvedEmail,
        mobile: resolvedMobile,
        role: resolvedRole,
      };

      setStoredUser(state.userDetail); // Store user in cookie
      localStorage.setItem("user", JSON.stringify(state.userDetail));
    },
    logoutR: (state) => {
      state.isLogin = false;
      state.token = null;
      state.userDetail = {
        userId: "",
        userID: "",
        userName: "",
        name: "",
        email: "",
        mobile: "",
        role: "",
      };
      removeAuthToken(); // Remove token from cookie
      removeStoredUser(); // Remove user from cookie
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    },
  },
});

export const { loginR, logoutR } = authSlice.actions;
export default authSlice.reducer;
