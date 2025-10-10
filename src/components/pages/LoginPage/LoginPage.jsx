import { useEffect, useState } from "react";
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

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [searchParams] = useSearchParams(); // For Google OAuth2 callback token

  // Handle input change for manual login
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
      console.log("data==>", data);
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
        console.log("userData=====>", userData);


        // Dispatch login with full user info
        dispatch(
          loginR({
            token,
            userId: userData.userId,
            userName: userData.name,
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
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Login</h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="login-input"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="login-input"
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-button">
            Login
          </button>

          <button
            type="button"
            className="login-button google-login"
            onClick={handleGoogleLogin}
          >
            Login with Google
          </button>

          <p className="signup-text">
            Don’t have an account?{" "}
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









// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import "./Loginpage.css";
// import { loginR } from "../../../redux/authSlice";
// import { setCartItems } from "../../../redux/CartSlice";
// import { getAuthHeaders } from "../../../Services/UserService";

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isLogin = useSelector((state) => state.auth.isLogin);

//   const [credentials, setCredentials] = useState({
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });
//   };

//   const fetchCartData = async (userId, token) => {
//     try {
//       const response = await fetch(`http://localhost:8080/get-all-cart-items/${userId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           ...getAuthHeaders(),
//         },
//       });
//       const data = await response.json();
//       dispatch(setCartItems(data));
//     } catch (error) {
//       console.error("Error fetching cart data:", error);
//     }
//   };

//   useEffect(() => {
//     if (isLogin) navigate("/");
//   }, [isLogin, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://localhost:8080/users/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(credentials),
//       });

//       if (!response.ok) {
//         alert("Invalid email or password");
//         return;
//       }

//       const data = await response.json();
//       const { userID, userName, email, mobile, role, token } = data.data;

//       localStorage.setItem("authToken", token);
//       dispatch(loginR({ email, userName, userID, mobile, role, token }));
//       await fetchCartData(userID, token);

//       alert("Login successful!");
//       navigate("/");
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   // ✅ Redirect user to Google OAuth2 Login
//   const handleGoogleLogin = () => {
//     window.location.href = "http://localhost:8080/oauth2/authorization/google";
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <form className="login-form" onSubmit={handleSubmit}>
//           <h2 className="login-title">Login</h2>

//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             className="login-input"
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             className="login-input"
//             onChange={handleChange}
//             required
//           />

//           <button type="submit" className="login-button">
//             Login
//           </button>

//           {/* 🧠 Google OAuth2 Button */}
//           <button
//             type="button"
//             className="login-button google-login"
//             onClick={handleGoogleLogin}
//           >
//             Login with Google
//           </button>

//           <p className="signup-text">
//             Don't have an account?{" "}
//             <span className="signup-link" onClick={() => navigate("/signup")}>
//               Create New Account
//             </span>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;






