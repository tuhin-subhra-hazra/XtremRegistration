export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div
      style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "20px"
      }}
    >
      <h3>Admin Panel</h3>

      <div
        onClick={() => setActiveTab("dashboard")}
        style={{
          padding: "10px",
          cursor: "pointer",
          background: activeTab === "dashboard" ? "#333" : "transparent"
        }}
      >
        📊 Dashboard
      </div>

      <div
        onClick={() => setActiveTab("manage")}
        style={{
          padding: "10px",
          cursor: "pointer",
          background: activeTab === "manage" ? "#333" : "transparent"
        }}
      >
        ❓ Manage Questions
      </div>
    </div>
  );
}
