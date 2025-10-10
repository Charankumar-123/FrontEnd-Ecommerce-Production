import React from "react";
import { useSelector } from "react-redux";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userDetail = useSelector((state) => state.auth.userDetail);
  const isLogin = useSelector((state) => state.auth.isLogin);

  if (!isLogin) {
    return <h2>Please login to view your profile</h2>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-details">
        <p><strong>ID:</strong> {userDetail.userId}</p>
        {/* <p><strong>Name:</strong> {userDetail.name}</p> */}
        <p><strong>Email:</strong> {userDetail.email}</p>
        <p><strong>Mobile:</strong> {userDetail.mobile}</p>
        <p><strong>Role:</strong> {userDetail.role}</p>
      </div>
      <div className="view-orders">
        <button className="view-orders-btn" onClick={() => navigate("/orders") }>
        View Orders
        </button>

      </div>
    </div>
  );
};

export default ProfilePage;
