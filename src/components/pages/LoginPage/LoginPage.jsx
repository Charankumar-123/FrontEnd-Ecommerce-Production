import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Loginpage.css";
import { loginR } from "../../../redux/authSlice";
import { setCartItems } from "../../../redux/CartSlice";
import { getAuthHeaders } from "../../../Services/UserService";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth.isLogin);

  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [searchParams] = useSearchParams();

  // Explicitly reset credentials on component mount to clear any browser autofill
  useEffect(() => {
    setCredentials({ email: "", password: "" });
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Fetch cart items after login
  const fetchCartData = async (userId, token) => {
    try {
      if (!userId || !token) return;
      const response = await fetch(`http://localhost:8080/get-all-cart-items/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cart data");
      const data = await response.json();
      dispatch(setCartItems(data));
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        alert("Invalid email or password");
        return;
      }

      const data = await response.json();
      const { userID, userName, email, mobile, role, token } = data.data;

      // Store JWT token in local storage
      localStorage.setItem("authToken", token);

      // Dispatch Redux action
      dispatch(loginR({ email, userName, userID, mobile, role, token }));

      // Fetch user cart
      await fetchCartData(userID, token);

      alert("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login error. Please try again.");
    }
  };

  // Redirect to Google OAuth2 login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  // Handle Google OAuth2 callback token
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("authToken", token);

      // Fetch user info from backend
      const fetchUserInfo = async () => {
        try {
          const response = await fetch("http://localhost:8080/users/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch user info");

          const userData = await response.json();

          // Dispatch login with full user info
          dispatch(
            loginR({
              token,
              userId: userData.userId,
              userName: userData.userName || userData.name,
              email: userData.email,
              mobile: userData.mobile,
              role: userData.role,
            })
          );

          await fetchCartData(userData.userId, token);
          navigate("/");
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };

      fetchUserInfo();
    }
  }, [searchParams, dispatch, navigate]);

  // Redirect logged-in users automatically to home
  useEffect(() => {
    if (isLogin) navigate("/");
  }, [isLogin, navigate]);

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-name">ModernStore</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          {/* Decoy inputs to trap aggressive browser autofill */}
          <input type="text" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
          <input type="password" style={{ display: "none" }} tabIndex={-1} autoComplete="new-password" />

          <h2 className="login-title">Sign In</h2>
          <p className="login-subtitle">Welcome back! Access your orders and cart</p>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              className="login-input"
              value={credentials.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group password-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="login-input password-field"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈 Hide" : "👁️ Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="signup-text">
            Don't have an account?{" "}
            <span className="signup-link" onClick={() => navigate("/signup")}>
              Create New Account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
