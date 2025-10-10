import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { loginR } from "../redux/authSlice";


const BASE_URL = "http://localhost:8080/users"; // Backend API base URL



// API call to signup a user
export const signup = async (userData) => {

 
  try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: "Signup failed. Please try again." };
  }
};

// API call to login a user
export const login = async (credentials) => {
  try {
    const response = await fetch("http://localhost:8080/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    const data = await response.json();

    if (data.token) {
      login.setToken(data.token);
    }


    
 
    return data; // Return the actual response data
  } catch (error) {
    console.error("Login API error:", error);
    return { status: false, message: "Login failed. Please check credentials." };
  }
};


// API call to add a user
export const addUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: "Failed to add user. Please try again." };
  }
};

// API call to get all users
export const getUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/getusers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: "Failed to retrieve users. Please try again." };
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

