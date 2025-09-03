import React, { useEffect, useState, useRef } from "react";
import {
    FaBell,
    FaUserCircle,
    FaAngleDoubleLeft,
    FaBars,
    FaTimes,
} from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./Navbar.css"; // normal CSS import

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [username, setUsername] = useState("User");
    const dropdownRef = useRef(null);

    useEffect(() => {
        const user = localStorage.getItem("user_data");
        if (user) {
            try {
                const userObj = JSON.parse(user);
                if (userObj?.name) {
                    setUsername(userObj.name);  // yaha "Shubham Gupta" set hoga
                }
            } catch {
                setUsername("User");
            }
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);



    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <header className="navbar">
            {/* Left back button (desktop only) */}
            <button className="back-btn">
                <FaAngleDoubleLeft className="icon-sm" />
            </button>

            {/* Right user info */}
            <div className="user-info">
                <FaBell className="icon-md" />
                <FaUserCircle className="icon-lg" />

                {/* Username with dropdown */}
                <div className="user-dropdown" ref={dropdownRef}>
                    <span
                        className="username flex items-center gap-1"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span className="font-medium text-black">{username}</span>
                        <RiArrowDropDownLine size={22} />
                    </span>
                    {dropdownOpen && (
                        <ul className="dropdown-menu">
                            <li className="dropdown-header">
                                <span className="font-medium text-black">{username}</span><br />
                                <span className="dropdown-email">{(JSON.parse(localStorage.getItem("user_data"))?.email) || ""}</span>
                            </li>
                            <li onClick={handleLogout}>Log out</li>
                        </ul>
                    )}
                </div>

                {/* Mobile hamburger / close */}
                <button
                    className="menu-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? (
                        <FaTimes className="icon-md" />
                    ) : (
                        <FaBars className="icon-md" />
                    )}
                </button>
            </div>
        </header>
    );
}
