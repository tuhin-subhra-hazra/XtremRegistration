import { useState } from "react";
import Sidebar from "../../component/admin/Sidebar";
import Dashboard from "./Dashboard";
import ManageQuestions from "../../component/admin/ManageQuestions";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, padding: "20px" }}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "manage" && <ManageQuestions />}
      </div>
    </div>
  );
}
