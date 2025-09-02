import React from "react";
import "./Sidebar.css"; // normal CSS import

const menuItems = [
  { name: "Dashboard", icon: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749203830/saka_i1vg99.svg" },
  { name: "Earnings", icon: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749203830/saka_i1vg99.svg" },
  { name: "Deals", icon: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749203830/saka_i1vg99.svg" },
  { name: "Partner Playbook", icon: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749203830/saka_i1vg99.svg" },
];

export default function Sidebar({ open }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <img
          src="https://res.cloudinary.com/dqjbzgksw/image/upload/v1756116348/Untitled-1_t7afxj.svg"
          alt="Logo"
          className="logo"
        />
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="sidebar-item">
              <span className="sidebar-icon">
                <img src={item.icon} alt={item.name} className="menu-icon" />
              </span>
              <span className="sidebar-text">{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
