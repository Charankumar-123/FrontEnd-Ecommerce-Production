import { createSlice } from "@reduxjs/toolkit";
import { login as loginService } from "../Services/UserService";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLogin: false,
    token: null,
    userDetail: {
      userId: '',
      name: 'unknown',
      email: '',
      mobile: '',
      role: '',
    },
  },
  reducers: {
    loginR: (state, action) => {
      state.isLogin = true; 
      state.token = action.payload.token;
      console.log("payload token", action.payload.token);
      state.userDetail.userId = action.payload.userID;
      // console.log("payload=>",state.userDetail.userId);

      state.userDetail.name = action.payload.userName; 
      state.userDetail.email = action.payload.email;
      state.userDetail.mobile = action.payload.mobile;
      state.userDetail.role = action.payload.role; 
    },
    logoutR: (state) => {
      state.user = null;
      state.isLogin = false;
    },
  },
});

export const { loginR, logoutR } = authSlice.actions;
export default authSlice.reducer;
