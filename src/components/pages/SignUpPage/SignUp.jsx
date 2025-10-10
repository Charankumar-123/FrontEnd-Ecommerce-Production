import { useState } from "react";
import { useDispatch } from "react-redux";
// import { login } from "../../../redux/authSlice";
import { signup } from "../../../Services/UserService";
import { login } from "../../../Services/UserService";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(userData);
      if (response.status) {
        alert("Signup successful! Redirecting to login...");
        navigate("/login"); // Redirect user to login page
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };


  return (
    <div className="signup-container">
      <div className="signup-box">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="signup-title">Sign Up</h2>

          <input type="text" name="name" placeholder="Name" className="signup-input" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="signup-input" onChange={handleChange} required />
          <input type="tel" name="mobile" placeholder="Mobile Number" className="signup-input" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="signup-input" onChange={handleChange} required />

          <button type="submit" className="signup-button">Sign Up</button>

          {/* Redirect to Login Page */}
          <p className="login-text">
            Already have an account?{" "}
            <span className="login-link" onClick={() => navigate("/login")}>
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
