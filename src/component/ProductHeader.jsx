import React from "react";
import "../App.css";

export default function ProductHeader({ className = "" }) {
  const items = [
    { key: "xHawkEye", title: "xHawkEye", img: "/logos/xHawkEye.png" },
    { key: "ncms", title: "NCMS", img: "/logos/NCMS.png" },
    { key: "eChowkidar", title: "eChowkidar", img: "/logos/eChowkidar.png" },
    { key: "tradeTally", title: "tradeTally", img: "/logos/tradeTally.png" },
    { key: "mPower", title: "mPower", img: "/logos/mPower.png" }
  ];

  return (
    <div className={"product-header " + className} style={{ padding: "18px 12px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        {items.map(item => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", padding: "5px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", minWidth: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0ea5e9, #9333ea)" }}>
              <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, display: "none" }}></div>
            </div>
            {/* <div>
              <div style={{ fontSize: 13, color: "#f8fafc", fontWeight: 700 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#9aa3c7" }}>Explore</div>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
