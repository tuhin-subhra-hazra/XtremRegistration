import { useEffect, useState } from "react";
import "../App.css";
import ProductHeader from "./ProductHeader";

export default function QuizComplete() {

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href =
        `https://wa.me/${import.meta.env.VITE_RECIPIENT_WA_NUMBER}?text=Hi`;
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <ProductHeader />
      <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}>
      <div className="form-container" style={{
        textAlign: "center",
        padding: "40px",
        borderRadius: "24px",
        maxWidth: "400px",
        width: "90%"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>✅</h2>
        <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>Form Submitted!</h2>
        <p style={{ color: "#c2c2c2ff", fontSize: "1.1rem" }}>
          Thanks for sharing your thoughts. Your responses have been recorded.
        </p>
        {/* You could add a 'Submit another response' button here */}
      </div>
    </div>
    </div>
  );
}
