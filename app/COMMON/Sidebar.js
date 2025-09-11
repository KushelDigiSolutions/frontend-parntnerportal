import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Sidebar.css"; // normal CSS import

export default function Sidebar({ open }) {
  const pathname = usePathname();

  // Get role from localStorage
  let role = "partner";
  try {
    const user = localStorage.getItem("user_data");
    if (user) {
      const userObj = JSON.parse(user);
      if (userObj?.role) role = userObj.role;
    }
  } catch { }

  // Define menu items for each role
  const adminMenu = [
    { name: "Dashboard", icon: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749203830/saka_i1vg99.svg", link: "/dashboard" },
    { name: "Partner Request", icon: "   https://cdn-icons-png.flaticon.com/512/4458/4458537.png " },
    { name: "Refer Client", icon: "   https://cdn-icons-png.flaticon.com/512/7125/7125052.png " },
    { name: "Partner Playbook", icon: "   https://cdn-icons-png.flaticon.com/512/566/566973.png " },
  ];

  const partnerMenu = [
    { name: "Dashboard", icon: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749203830/saka_i1vg99.svg" },
    { name: "Earnings", icon: "   https://cdn-icons-png.flaticon.com/512/8028/8028560.png " },
    { name: "Deals", icon: "https://cdn-icons-png.flaticon.com/512/9091/9091860.png" },
    { name: "Partner Playbook", icon: "   https://cdn-icons-png.flaticon.com/512/566/566973.png " },
  ];
  const menuItems = role === "admin" ? adminMenu : partnerMenu;

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
          {menuItems.map((item) => {
            const itemPath = item.link || `/${item.name.toLowerCase().replace(/ /g, "-")}`;
            const isActive = pathname === itemPath;
            return (
              <li key={item.name} className={`sidebar-item${isActive ? " active bg-blue-100" : ""}`}>
                <Link href={itemPath} className="sidebar-link flex items-center gap-2">
                  <span className="sidebar-icon">
                    <img src={item.icon} alt={item.name} className="menu-icon" />
                  </span>
                  <span className="sidebar-text">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
