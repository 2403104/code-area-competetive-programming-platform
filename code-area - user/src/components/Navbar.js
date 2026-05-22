import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth-token'));
    const [username, setUsername] = useState("");

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
    };

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('auth-token'));
        if (isLoggedIn) {
            setUsername(localStorage.getItem('username'));
        }
    }, [location]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ height: '70px' }}>
            <div className="container">
                <Link className="navbar-brand fs-3 fw-bold text-dark" to="/">
                    &lt;/&gt;CodeArea&lt;/&gt;
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item mx-2">
                            <Link className={`nav-link fs-5 ${location.pathname === "/" ? "active border-bottom border-primary" : "text-dark"}`} to="/">Home</Link>
                        </li>
                        <li className="nav-item mx-2">
                            <Link className={`nav-link fs-5 ${location.pathname === "/problems" ? "active border-bottom border-primary" : "text-dark"}`} to="/problems">Problems</Link>
                        </li>
                        <li className="nav-item mx-2">
                            <Link className={`nav-link fs-5 ${location.pathname === "/contest" ? "active border-bottom border-primary" : "text-dark"}`} to="/contest">Contest</Link>
                        </li>
                        <li className="nav-item mx-2">
                            <Link className={`nav-link fs-5 ${location.pathname === "/discussions" ? "active border-bottom border-primary" : "text-dark"}`} to="/discussions">Discussions</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center px-3 py-2">
                        <div className="ms-auto d-flex align-items-center gap-3">
                            {!isLoggedIn ? (
                                <>
                                    <Link
                                        to="/auth/codearea-login"
                                        className="text-decoration-none text-primary fw-semibold fs-5 px-2 py-1"
                                        style={{ border: '1px solid #0d6efd', borderRadius: '6px' }}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/auth/codearea-signup"
                                        className="text-decoration-none text-primary fw-semibold fs-5 px-2 py-1"
                                        style={{ border: '1px solid #0d6efd', borderRadius: '6px' }}
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to={`/code-area/profile/${username}`}
                                        className="text-decoration-none text-success fw-bold fs-5"
                                        style={{ padding: '6px 10px' }}
                                    >
                                        {username}
                                    </Link>
                                    <span
                                        className="text-danger fw-bold fs-5"
                                        role="button"
                                        style={{ padding: '6px 10px', cursor: 'pointer' }}
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;