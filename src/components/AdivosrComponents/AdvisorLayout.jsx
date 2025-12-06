import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiMessageCircle,
  FiBarChart2,
  FiUser,
  FiBell,
  FiHelpCircle,
  FiMoon,
  FiSun
} from "react-icons/fi";
import "../../SharedStyles/Layout.css"

/* ============================
        HEADER
=============================== */
export function Header({ onOpenMenu }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("themeOption") || "light";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("themeOption", newTheme);
  };

  return (
      <nav className="navbar shadow-sm sticky-top">
        <div className="container-fluid">
          <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={onOpenMenu}
          >
            ☰
          </button>

          <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={toggleTheme}
              style={{ marginLeft: "auto" }}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
        </div>
      </nav>
  );
}
/* ============================
        SIDEBAR
=============================== */
export function Sidebar({ tab, setTab, isOpen, onClose, onLogout }) {

  const items = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
    { id: "feedback", label: "Feedback", icon: <FiMessageCircle /> },
    { id: "analyzer", label: "Analyzer", icon: <FiBarChart2 /> },
  ];

  return (
      <>
        {/* BACKDROP */}
        <div
            className={`pm-backdrop ${isOpen ? "show" : ""}`}
            onClick={onClose}
            aria-hidden="true"
        />

        {/* SIDEBAR */}
        <aside
            id="pmSidebar"
            className={`sidebar-neo pm-slide ${isOpen ? "is-open" : ""}`}
            role="navigation"
        >
          {/* LOGO */}
          <div className="offcanvas-header sidebar-neo__brand">
            <div className="d-flex align-items-center gap-2">
              <img
                  src="/assets/HaseebLogo.png"
                  alt="Haseeb Logo"
                  className="sidebar-logo-img"
              />
            </div>
          </div>

          {/* MENU */}
          <div className="offcanvas-body p-0 d-flex flex-column">

            <nav className="py-3 px-3 flex-grow-1">
              {items.map((it) => {
                const active = tab === it.id;
                return (
                    <button
                        key={it.id}
                        onClick={() => {
                          setTab(it.id);
                          onClose();
                        }}
                        className={`sidebar-neo__item ${active ? "is-active" : ""}`}
                    >
                      <span className="sidebar-neo__icon">{it.icon}</span>
                      <span className="sidebar-neo__label">{it.label}</span>
                      {active && <span className="sidebar-neo__dot" />}
                    </button>
                );
              })}
            </nav>

            {/* SUPPORT LINK */}
            <div
                className="px-3 py-2 small text-muted"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setTab("support");
                  onClose();
                }}
            >
              Need Help?
            </div>
          </div>

          {/* DOCK AREA */}
          <div className="sidebar-neo__dock">
            <button
                className="sidebar-neo__dock-btn"
                onClick={() => {
                  setTab("account");
                  onClose();
                }}
            >
              <FiUser size={18} />
            </button>

            <button
                className="sidebar-neo__dock-btn"
                onClick={() => {
                  setTab("notifications");
                  onClose();
                }}
            >
              <FiBell size={18} />
            </button>
          </div>


          {/* LOGOUT */}
          <button
              className="sidebar-neo__logout"
              onClick={onLogout}>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>

        </aside>
      </>
  );
}