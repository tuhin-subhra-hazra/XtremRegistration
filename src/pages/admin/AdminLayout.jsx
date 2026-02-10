import { useState } from "react";
import Sidebar from "../../component/admin/Sidebar";
import Navbar from "../../component/admin/Navbar";
import Dashboard from "./Dashboard";
import ManageQuestions from "../../component/admin/ManageQuestions";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/Loader";

export default function AdminLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const auth = getAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    if (loggingOut) {
        return <Loader text="Logging out..." />;
    }

    const handleLogout = async () => {
        setLoggingOut(true);

        try {
            await signOut(auth);
            // setTimeout(() => {
                navigate("/admin", { replace: true });
            // }, 300);
        } catch (e) {
            console.error(e);
            setLoggingOut(false);
        }
    };

    const handleMenuToggle = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    return (
        <div>
            <Navbar onMenuToggle={handleMenuToggle} onLogout={handleLogout} />
            
            <div style={{ display: "flex", minHeight: "100vh", marginTop: "60px" }}>
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

                <div style={{ flex: 1, padding: "20px" }}>
                    {activeTab === "dashboard" && <Dashboard />}
                    {activeTab === "manage" && <ManageQuestions />}
                </div>
            </div>
        </div>
    );
}
