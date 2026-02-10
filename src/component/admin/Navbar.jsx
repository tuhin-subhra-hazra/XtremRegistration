import { useState } from "react";

export default function Navbar({ onMenuToggle, onLogout }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#111111CC",
        backdropFilter: "blur(10px)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 20px",
        zIndex: 1001,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "5px",
            display: "none"
          }}
          className="navbar-menu-btn"
        >
          ☰
        </button>
        <h2 style={{ margin: 0, fontSize: "20px" }}>Admin Panel</h2>
      </div>

      <button
        onClick={onLogout}
        style={{
          background: "#dc3545",
          color: "#fff",
          border: "none",
          padding: "8px 15px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500"
        }}
      >
        Logout
      </button>

      <style>{`
        @media (max-width: 768px) {
          .navbar-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .navbar-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
