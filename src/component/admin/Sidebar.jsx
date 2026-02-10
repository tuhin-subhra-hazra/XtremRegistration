import "../../App.css";

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, onClose }) {
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => {}}
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: 999,
            display: "block"
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#0a0a0a",
          color: "#fff",
          padding: "20px",
          transition: "width 0.3s ease, transform 0.3s ease",
          marginTop: "60px"
        }}
        className={`sidebar ${isMobileOpen ? "open" : ""}`}
      >
        <div
          onClick={() => handleTabChange("dashboard")}
          style={{
            padding: "10px",
            cursor: "pointer",
            background: activeTab === "dashboard" ? "#333" : "transparent",
            borderRadius: "4px",
            marginBottom: "10px",
            transition: "background 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
          className="sidebar-item"
          title="Dashboard"
        >
          <span className="icon">📊</span>
          <span className="label">Dashboard</span>
        </div>

        <div
          onClick={() => handleTabChange("manage")}
          style={{
            padding: "10px",
            cursor: "pointer",
            background: activeTab === "manage" ? "#333" : "transparent",
            borderRadius: "4px",
            transition: "background 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
          className="sidebar-item"
          title="Manage Questions"
        >
          <span className="icon">❓</span>
          <span className="label">Manage Questions</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 60px;
            left: 0;
            height: calc(100vh - 60px);
            width: 220px !important;
            transform: translateX(-100%);
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            margin-top: 0 !important;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-title {
            margin-top: 0;
          }

          .sidebar-item {
            justify-content: flex-start !important;
          }

          .sidebar-item .label {
            display: inline;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 200px !important;
          }
        }

        @media (min-width: 769px) {
          .sidebar {
            position: relative;
            transform: translateX(0) !important;
            width: 220px;
            margin-top: 0 !important;
          }

          .sidebar-item {
            justify-content: flex-start !important;
          }

          .sidebar-item .label {
            display: inline;
          }
        }
      `}</style>
    </>
  );
}
