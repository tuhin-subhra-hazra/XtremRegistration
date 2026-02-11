import { ref, onValue, update, remove } from "firebase/database";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import Loader from "../../component/Loader";

export default function Dashboard() {
    const [users, setUsers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        onValue(ref(db, "XtremUser"), snap => {
            setUsers(snap.val() || {});
        });
    }, []);

    useEffect(() => {
        onValue(ref(db, "quiz/quiz1/questions"), snap => {
            const data = snap.val();
            if (data) {
                const questionsArray = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value
                }));
                const sorted = questionsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
                setQuestions(sorted);
            }
        });
    }, []);

    // Fetch answers for all users
    useEffect(() => {
        onValue(ref(db, "answers/quiz1"), snap => {
            const data = snap.val();
            if (data) {
                setUserAnswers(data);
            }
        });
    }, []);

    const giftUser = (id) => {
        update(ref(db, `XtremUser/${id}`), { isGifted: true });
    };

    const deleteUser = (id, userName) => {
        if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            remove(ref(db, `XtremUser/${id}`));
        }
    };

    const toggleExpand = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const getAnswerStatus = (userAnswer, correctAnswer) => {
        return userAnswer === correctAnswer ? { isCorrect: true, icon: "✓" } : { isCorrect: false, icon: "✗" };
    };

    // Filter users based on search query
    const filteredUsers = Object.entries(users).filter(([id, u]) => {
        const query = searchQuery.toLowerCase();
        return (
            u.name?.toLowerCase().includes(query) ||
            u.mobile?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.companyName?.toLowerCase().includes(query)
        );
    });

    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                borderRadius: "22px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)",
                padding: "clamp(20px, 5vw, 30px)",
                color: "#fff"
            }}>
                <div style={{ marginBottom: "clamp(20px, 5vw, 30px)" }}>
                    <h2 style={{
                        fontSize: "clamp(22px, 6vw, 28px)",
                        fontWeight: "700",
                        background: "linear-gradient(to right, #fff, #94a3b8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: "0 0 20px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        Registration Dashboard
                    </h2>

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="🔍 Search by name, mobile, email, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px)",
                            fontSize: "clamp(13px, 3vw, 14px)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "12px",
                            background: "rgba(0, 0, 0, 0.3)",
                            color: "#fff",
                            boxSizing: "border-box",
                            outline: "none",
                            transition: "all 0.3s",
                            backdropFilter: "blur(10px)"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "#6366f1";
                            e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                </div>

                <div style={{ overflowX: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(([id, u]) => (
                            <div key={id} className="dashboard-user-container">
                                {/* User Row */}
                                <div
                                    onClick={() => toggleExpand(id)}
                                    className="dashboard-user-row"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.04)",
                                        border: "1px solid rgba(255, 255, 255, 0.12)",
                                        borderRadius: "12px",
                                        padding: "clamp(12px, 3vw, 16px)",
                                        cursor: "pointer",
                                        transition: "all 0.3s",
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1.5fr 2fr 1.5fr auto",
                                        gap: "15px",
                                        alignItems: "center"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
                                        e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#9aa3c7", marginBottom: "4px" }}>Name</div>
                                        <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: "600" }}>{u.name}</div>
                                    </div>
                                    <div className="hide-on-mobile">
                                        <div style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#9aa3c7", marginBottom: "4px" }}>Mobile</div>
                                        <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: "600" }}>{u.mobile}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#9aa3c7", marginBottom: "4px" }}>Email</div>
                                        <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: "600", wordBreak: "break-word" }}>{u.email}</div>
                                    </div>
                                    <div className="hide-on-mobile">
                                        <div style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#9aa3c7", marginBottom: "4px" }}>Company</div>
                                        <div style={{ fontSize: "clamp(12px, 3vw, 14px)", fontWeight: "600", wordBreak: "break-word" }}>{u.companyName}</div>
                                    </div>
                                    <div style={{ textAlign: "center", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                                        {u.isGifted ? (
                                            <button style={{
                                                padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                                                background: "rgba(34, 197, 94, 0.2)",
                                                color: "#22c55e",
                                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                fontSize: "clamp(10px, 2vw, 12px)",
                                                cursor: "not-allowed",
                                                opacity: 0.8,
                                                whiteSpace: "nowrap"
                                            }} disabled>✓ Gifted</button>
                                        ) : (
                                            <button onClick={() => giftUser(id)} style={{
                                                padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                fontSize: "clamp(10px, 2vw, 12px)",
                                                cursor: "pointer",
                                                transition: "all 0.3s",
                                                whiteSpace: "nowrap"
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                                            >
                                                Mark Gifted
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteUser(id, u.name);
                                            }} 
                                            style={{
                                                padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                                                background: "rgba(239, 68, 68, 0.2)",
                                                color: "#ef4444",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                fontSize: "clamp(10px, 2vw, 12px)",
                                                cursor: "pointer",
                                                transition: "all 0.3s",
                                                whiteSpace: "nowrap"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "rgba(239, 68, 68, 0.3)";
                                                e.target.style.transform = "translateY(-2px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "rgba(239, 68, 68, 0.2)";
                                                e.target.style.transform = "translateY(0)";
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedUser === id && (
                                    <div style={{
                                        background: "rgba(168, 85, 247, 0.08)",
                                        border: "1px solid rgba(168, 85, 247, 0.2)",
                                        borderTop: "none",
                                        borderRadius: "0 0 12px 12px",
                                        padding: "clamp(15px, 4vw, 20px)",
                                        marginBottom: "12px"
                                    }}>
                                        <h3 style={{
                                            fontSize: "clamp(14px, 4vw, 16px)",
                                            fontWeight: "700",
                                            marginTop: "0",
                                            marginBottom: "16px",
                                            color: "#d8b4fe"
                                        }}>
                                            📋 Quiz Answers
                                        </h3>

                                        {userAnswers[id] && questions.length > 0 ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                                {questions.filter(q => q.active !== false).map((q, index) => {
                                                    const userAnswer = userAnswers[id][q.id];
                                                    const status = getAnswerStatus(userAnswer, q.correct);
                                                    return (
                                                        <div
                                                            key={q.id}
                                                            style={{
                                                                background: "rgba(0, 0, 0, 0.3)",
                                                                border: `1px solid ${status.isCorrect ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                                                                borderRadius: "10px",
                                                                padding: "clamp(12px, 3vw, 14px)",
                                                                transition: "all 0.3s"
                                                            }}
                                                        >
                                                            <div style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "flex-start",
                                                                marginBottom: "10px",
                                                                gap: "10px"
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        fontSize: "15px",
                                                                        color: "#F6EB61",
                                                                        fontWeight: "700",
                                                                        marginBottom: "4px"
                                                                    }}>
                                                                        Q{index + 1}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: "clamp(12px, 3vw, 13px)",
                                                                        fontWeight: "600",
                                                                        color: "#fff",
                                                                        lineHeight: "1.5"
                                                                    }}>
                                                                        {q.question}
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    minWidth: "32px",
                                                                    height: "32px",
                                                                    borderRadius: "50%",
                                                                    background: status.isCorrect ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                                                    color: status.isCorrect ? "#22c55e" : "#ef4444",
                                                                    fontWeight: "700",
                                                                    fontSize: "16px",
                                                                    flexShrink: 0
                                                                }}>
                                                                    {status.icon}
                                                                </div>
                                                            </div>

                                                            <div style={{ marginBottom: "10px" }}>
                                                                <div className="options-grid" style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "1fr 1fr",
                                                                    gap: "8px"
                                                                }}>
                                                                    {Object.entries(q.options).map(([key, value]) => {
                                                                        const isUserAnswer = userAnswer === key;
                                                                        const isCorrect = q.correct === key;
                                                                        let bgColor = "rgba(255, 255, 255, 0.02)";
                                                                        let borderColor = "rgba(255, 255, 255, 0.08)";
                                                                        let textColor = "#9aa3c7";

                                                                        if (isCorrect) {
                                                                            bgColor = "rgba(34, 197, 94, 0.15)";
                                                                            borderColor = "rgba(34, 197, 94, 0.4)";
                                                                            textColor = "#22c55e";
                                                                        } else if (isUserAnswer && !isCorrect) {
                                                                            bgColor = "rgba(239, 68, 68, 0.15)";
                                                                            borderColor = "rgba(239, 68, 68, 0.4)";
                                                                            textColor = "#ef4444";
                                                                        }

                                                                        return (
                                                                            <div
                                                                                key={key}
                                                                                style={{
                                                                                    padding: "clamp(8px, 2vw, 10px) clamp(10px, 2vw, 12px)",
                                                                                    background: bgColor,
                                                                                    border: `1px solid ${borderColor}`,
                                                                                    borderRadius: "8px",
                                                                                    fontSize: "clamp(11px, 2vw, 12px)",
                                                                                    color: textColor,
                                                                                    fontWeight: isUserAnswer || isCorrect ? "600" : "400"
                                                                                }}
                                                                            >
                                                                                <div style={{ fontWeight: "700", marginBottom: "2px" }}>
                                                                                    {key.toUpperCase()}
                                                                                </div>
                                                                                <div style={{ fontSize: "clamp(10px, 2vw, 11px)" }}>
                                                                                    {value}
                                                                                </div>
                                                                                {isUserAnswer && <div style={{ marginTop: "4px", fontSize: "clamp(9px, 2vw, 10px)" }}>👤 Your Answer</div>}
                                                                                {isCorrect && <div style={{ marginTop: "4px", fontSize: "clamp(9px, 2vw, 10px)" }}>✓ Correct</div>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: "center",
                                                padding: "30px 20px",
                                                color: "#9aa3c7"
                                            }}>
                                                <p style={{ fontSize: "clamp(12px, 3vw, 14px)", marginBottom: "8px" }}>❌ No quiz answers yet</p>
                                                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", margin: 0 }}>This user hasn't completed the quiz</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "#9aa3c7"
                            }}>
                                <p style={{ fontSize: "clamp(16px, 4vw, 18px)", marginBottom: "8px" }}>🔎 No results found</p>
                                <p style={{ fontSize: "clamp(12px, 3vw, 14px)", margin: 0 }}>Try searching with a different name, mobile, email, or company</p>
                            </div>
                        )}
                    </div>

                    {Object.entries(users).length === 0 && (
                        <div style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#9aa3c7"
                        }}>
                            <p style={{ fontSize: "clamp(16px, 4vw, 18px)", marginBottom: "8px" }}>📭 No users yet</p>
                            <p style={{ fontSize: "clamp(12px, 3vw, 14px)", margin: 0 }}>Users will appear here when they register</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .dashboard-user-row {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }

                    .hide-on-mobile {
                        display: none !important;
                    }

                    .dashboard-user-container {
                        padding: 0 !important;
                    }

                    .options-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
