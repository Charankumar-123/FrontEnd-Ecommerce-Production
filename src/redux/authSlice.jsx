import { createSlice } from "@reduxjs/toolkit";
import { login as loginService } from "../Services/UserService";

const savedToken = localStorage.getItem("authToken");
const savedUserStr = localStorage.getItem("user");
let initialUserDetail = {
  userId: "",
  userID: "",
  userName: "",
  name: "",
  email: "",
  mobile: "",
  role: "",
};

if (savedUserStr) {
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
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    },
  },
});

export const { loginR, logoutR } = authSlice.actions;
export default authSlice.reducer;
