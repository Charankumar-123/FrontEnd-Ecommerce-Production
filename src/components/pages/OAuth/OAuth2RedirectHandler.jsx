import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginR } from "../../../redux/authSlice";

const OAuth2RedirectHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userID = searchParams.get("userID"); // if backend sends it
    console.log("userID", userID);
    if (token) {
      localStorage.setItem("authToken", token);
      dispatch(loginR({ token }));
      navigate("/"); // redirect to home
    } else {
      navigate("/login"); // redirect to login if no token
    }
  }, [dispatch, navigate, searchParams]);

  return <p>Logging you in...</p>;
};

export default OAuth2RedirectHandler;
