import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutR } from '../../../redux/authSlice';
import { clearCart } from '../../../redux/CartSlice';

const NavigationBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userDetail, isLogin } = useSelector((state) => state.auth);

    const isAdmin = userDetail?.role === "admin";

    const handleLogout = () => {
        dispatch(logoutR());
        dispatch(clearCart());
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-dark bg-success fixed-top">
            <div className="container-fluid">
                {/* Left-aligned brand */}
                <Link className="navbar-brand" to="/">E-Commerce</Link>

                {/* Centered Navigation Items */}
                <div className="d-flex mx-auto">
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link className="nav-link active text-white" to="/">Home</Link>
                        </li>

                        { (
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/cart">Cart</Link>
                            </li>
                        )}

                        {!isAdmin && (
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/contactus">Contact Us</Link>
                            </li>
                        )}

                        {isAdmin && (
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/addproduct">Add Products</Link>
                            </li>
                        )}

                        {isLogin && (
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/profile">Profile</Link>
                            </li>
                        )}

                        {isLogin ? (
                            <li className="nav-item">
                                <button onClick={handleLogout} className="btn btn-warning">Logout</button>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="btn btn-success text-white" to="/login">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
