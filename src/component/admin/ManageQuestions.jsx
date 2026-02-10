import { useState, useEffect } from "react";
import { ref, set, remove, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function ManageQuestions() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState({
        a: "",
        b: "",
        c: "",
        d: ""
    });
    const [correct, setCorrect] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        question: "",
        options: { a: "", b: "", c: "", d: "" },
        correct: ""
    });

    // Fetch questions from database
    useEffect(() => {
        const questionsRef = ref(db, "quiz/quiz1/questions");
        onValue(questionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const questionsArray = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...value
                }));
                // Sort by order field if it exists, otherwise keep original order
                const sortedQuestions = questionsArray.sort((a, b) => {
                    return (a.order || 0) - (b.order || 0);
                });
                setQuestions(sortedQuestions);
            } else {
                setQuestions([]);
            }
        });
    }, []);

    const saveQuestion = async () => {
        if (!question || !options.a || !options.b || !options.c || !options.d || !correct) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const qid = "q" + Date.now();
            const order = questions.length; // Set order based on current number of questions
            await set(ref(db, `quiz/quiz1/questions/${qid}`), {
                question,
                options,
                correct,
                order
            });
            alert("Question Saved ✅");

            // Reset form
            setQuestion("");
            setOptions({ a: "", b: "", c: "", d: "" });
            setCorrect("");
        } catch (error) {
            console.error("Error saving question:", error);
            alert("Error saving question");
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (id) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                await remove(ref(db, `quiz/quiz1/questions/${id}`));
                alert("Question Deleted ✅");
            } catch (error) {
                console.error("Error deleting question:", error);
                alert("Error deleting question");
            }
        }
    };

    const startEdit = (q) => {
        setEditingId(q.id);
        setEditData({
            question: q.question,
            options: { ...q.options },
            correct: q.correct
        });
    };

    const saveEditedQuestion = async () => {
        if (!editData.question || !editData.options.a || !editData.options.b || !editData.options.c || !editData.options.d || !editData.correct) {
            alert("Please fill all fields");
            return;
        }

        try {
            await set(ref(db, `quiz/quiz1/questions/${editingId}`), {
                question: editData.question,
                options: editData.options,
                correct: editData.correct
            });
            alert("Question Updated ✅");
            setEditingId(null);
        } catch (error) {
            console.error("Error updating question:", error);
            alert("Error updating question");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({
            question: "",
            options: { a: "", b: "", c: "", d: "" },
            correct: ""
        });
    };

    const moveQuestion = async (currentIndex, direction) => {
        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= questions.length) return;

        try {
            const movedQuestion = questions[currentIndex];
            const targetQuestion = questions[newIndex];

            // Swap order values in database
            await set(ref(db, `quiz/quiz1/questions/${movedQuestion.id}`), {
                ...movedQuestion,
                order: newIndex
            });

            await set(ref(db, `quiz/quiz1/questions/${targetQuestion.id}`), {
                ...targetQuestion,
                order: currentIndex
            });
        } catch (error) {
            console.error("Error reordering questions:", error);
            alert("Error reordering questions");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            padding: "20px",
            background: "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.18), transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.18), transparent 50%), #0f172a",
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "40px", textAlign: "center" }}>
                    <h1 style={{
                        fontSize: "clamp(28px, 5vw, 40px)",
                        fontWeight: "800",
                        background: "linear-gradient(to right, #fff, #94a3b8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: "0 0 10px 0"
                    }}>
                        Manage Questions
                    </h1>
                    <p style={{ color: "#9aa3c7", fontSize: "clamp(13px, 2vw, 16px)", margin: 0 }}>
                        Create, edit, delete, and reorder your quiz questions
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "clamp(300px, 40%, 500px) 1fr",
                    gap: "30px",
                    alignItems: "start"
                }} className="questions-grid">
                    {/* Left Column - Form */}
                    <div>
                        <div style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            backdropFilter: "blur(20px)",
                            padding: "clamp(20px, 5vw, 30px)",
                            borderRadius: "22px",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)",
                            position: "sticky",
                            top: "20px"
                        }}>
                            <h2 style={{
                                fontSize: "clamp(18px, 4vw, 22px)",
                                fontWeight: "700",
                                background: "linear-gradient(to right, #fff, #94a3b8)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                margin: "0 0 20px 0"
                            }}>
                                ➕ New Question
                            </h2>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#9aa3c7",
                                    marginBottom: "8px"
                                }}>
                                    Question
                                </label>
                                <textarea
                                    placeholder="Enter your question here..."
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 14px",
                                        border: "1px solid rgba(255, 255, 255, 0.12)",
                                        borderRadius: "12px",
                                        background: "rgba(0, 0, 0, 0.35)",
                                        color: "#fff",
                                        fontSize: "14px",
                                        boxSizing: "border-box",
                                        resize: "vertical",
                                        minHeight: "70px",
                                        outline: "none",
                                        transition: "all 0.3s",
                                        fontFamily: "inherit"
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

                            <label style={{
                                display: "block",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#9aa3c7",
                                marginBottom: "10px"
                            }}>
                                Options
                            </label>

                            {["a", "b", "c", "d"].map(key => (
                                <input
                                    key={key}
                                    placeholder={`Option ${key.toUpperCase()}`}
                                    value={options[key]}
                                    onChange={e => setOptions({ ...options, [key]: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        border: "1px solid rgba(255, 255, 255, 0.12)",
                                        borderRadius: "10px",
                                        background: "rgba(0, 0, 0, 0.35)",
                                        color: "#fff",
                                        fontSize: "13px",
                                        boxSizing: "border-box",
                                        marginBottom: "8px",
                                        outline: "none",
                                        transition: "all 0.3s"
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
                            ))}

                            <label style={{
                                display: "block",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#9aa3c7",
                                marginBottom: "8px",
                                marginTop: "12px"
                            }}>
                                Correct Answer
                            </label>
                            <select
                                value={correct}
                                onChange={e => setCorrect(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                    borderRadius: "10px",
                                    background: "rgba(0, 0, 0, 0.35)",
                                    color: "#fff",
                                    fontSize: "13px",
                                    boxSizing: "border-box",
                                    cursor: "pointer",
                                    outline: "none",
                                    transition: "all 0.3s",
                                    marginBottom: "20px"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#6366f1";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                                    e.target.style.boxShadow = "none";
                                }}
                            >
                                <option value="">Select Correct Answer</option>
                                <option value="a">Option A</option>
                                <option value="b">Option B</option>
                                <option value="c">Option C</option>
                                <option value="d">Option D</option>
                            </select>

                            <button
                                onClick={saveQuestion}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1,
                                    transition: "all 0.3s",
                                    boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)"
                                }}
                                onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
                                onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)")}
                            >
                                {loading ? "Saving..." : "Save Question"}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Questions List */}
                    <div>
                        <div style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            backdropFilter: "blur(20px)",
                            padding: "clamp(20px, 5vw, 30px)",
                            borderRadius: "22px",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)",
                            position: "sticky",
                            top: "20px"
                        }}>
                            <h2 style={{
                                fontSize: "clamp(18px, 4vw, 22px)",
                                fontWeight: "700",
                                background: "linear-gradient(to right, #fff, #94a3b8)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                margin: "0 0 20px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}>
                                Questions
                                <span style={{
                                    //   background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                    color: "#fff",
                                    borderRadius: "20px",
                                    border: "1px solid var(--border)",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    <p style={{ color: "white" }}>{questions.length}</p>
                                </span>
                            </h2>

                            {questions.length === 0 ? (
                                <div style={{
                                    textAlign: "center",
                                    padding: "50px 20px",
                                    color: "#9aa3c7"
                                }}>
                                    <p style={{ fontSize: "16px", marginBottom: "10px" }}>📭 No questions yet</p>
                                    <p style={{ fontSize: "14px", margin: 0 }}>Create your first question to get started!</p>
                                </div>
                            ) : (
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                    maxHeight: "calc(100vh - 250px)",
                                    overflowY: "auto",
                                    paddingRight: "8px"
                                }}>
                                    {questions.map((q, index) => (
                                        <div
                                            key={q.id}
                                            style={{
                                                padding: "16px",
                                                background: editingId === q.id ? "rgba(168, 85, 247, 0.1)" : "rgba(255, 255, 255, 0.03)",
                                                border: editingId === q.id ? "1px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.08)",
                                                borderRadius: "12px",
                                                transition: "all 0.3s"
                                            }}
                                        >
                                            {editingId === q.id ? (
                                                // Edit Mode
                                                <div>
                                                    <label style={{
                                                        display: "block",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#9aa3c7",
                                                        marginBottom: "6px"
                                                    }}>
                                                        Question
                                                    </label>
                                                    <textarea
                                                        value={editData.question}
                                                        onChange={e => setEditData({ ...editData, question: e.target.value })}
                                                        style={{
                                                            width: "100%",
                                                            padding: "8px 12px",
                                                            border: "1px solid #a855f7",
                                                            borderRadius: "8px",
                                                            background: "rgba(0, 0, 0, 0.35)",
                                                            color: "#fff",
                                                            fontSize: "12px",
                                                            boxSizing: "border-box",
                                                            marginBottom: "10px",
                                                            resize: "vertical",
                                                            minHeight: "50px",
                                                            outline: "none",
                                                            fontFamily: "inherit"
                                                        }}
                                                    />

                                                    <label style={{
                                                        display: "block",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#9aa3c7",
                                                        marginBottom: "6px"
                                                    }}>
                                                        Options
                                                    </label>
                                                    {["a", "b", "c", "d"].map(key => (
                                                        <input
                                                            key={key}
                                                            placeholder={`Option ${key.toUpperCase()}`}
                                                            value={editData.options[key]}
                                                            onChange={e => setEditData({
                                                                ...editData,
                                                                options: { ...editData.options, [key]: e.target.value }
                                                            })}
                                                            style={{
                                                                width: "100%",
                                                                marginBottom: "6px",
                                                                padding: "8px 10px",
                                                                border: "1px solid #a855f7",
                                                                borderRadius: "8px",
                                                                background: "rgba(0, 0, 0, 0.35)",
                                                                color: "#fff",
                                                                fontSize: "12px",
                                                                boxSizing: "border-box",
                                                                outline: "none"
                                                            }}
                                                        />
                                                    ))}

                                                    <label style={{
                                                        display: "block",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#9aa3c7",
                                                        marginBottom: "6px",
                                                        marginTop: "10px"
                                                    }}>
                                                        Correct Answer
                                                    </label>
                                                    <select
                                                        value={editData.correct}
                                                        onChange={e => setEditData({ ...editData, correct: e.target.value })}
                                                        style={{
                                                            width: "100%",
                                                            padding: "8px 10px",
                                                            border: "1px solid #a855f7",
                                                            borderRadius: "8px",
                                                            background: "rgba(0, 0, 0, 0.35)",
                                                            color: "#fff",
                                                            fontSize: "12px",
                                                            boxSizing: "border-box",
                                                            cursor: "pointer",
                                                            marginBottom: "12px",
                                                            outline: "none"
                                                        }}
                                                    >
                                                        <option value="">Select Correct Answer</option>
                                                        <option value="a">Option A</option>
                                                        <option value="b">Option B</option>
                                                        <option value="c">Option C</option>
                                                        <option value="d">Option D</option>
                                                    </select>

                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={saveEditedQuestion}
                                                            style={{
                                                                flex: 1,
                                                                padding: "8px",
                                                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "8px",
                                                                fontWeight: "600",
                                                                fontSize: "12px",
                                                                cursor: "pointer",
                                                                transition: "all 0.3s"
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                                                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                                                        >
                                                            ✓ Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            style={{
                                                                flex: 1,
                                                                padding: "8px",
                                                                background: "rgba(255, 255, 255, 0.1)",
                                                                color: "#fff",
                                                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                                                borderRadius: "8px",
                                                                fontWeight: "600",
                                                                fontSize: "12px",
                                                                cursor: "pointer",
                                                                transition: "all 0.3s"
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                                                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                                                        >
                                                            ✕ Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode
                                                <div>
                                                    <div style={{
                                                        fontSize: "10px",
                                                        color: "#6366f1",
                                                        fontWeight: "600",
                                                        marginBottom: "4px"
                                                    }}>
                                                        Q{index + 1}
                                                    </div>
                                                    <div style={{
                                                        fontWeight: "600",
                                                        color: "#fff",
                                                        fontSize: "clamp(12px, 2vw, 14px)",
                                                        lineHeight: "1.5",
                                                        marginBottom: "10px"
                                                    }}>
                                                        {q.question}
                                                    </div>

                                                    <div style={{ marginBottom: "12px" }}>
                                                        {Object.entries(q.options).map(([key, value]) => (
                                                            <div
                                                                key={key}
                                                                style={{
                                                                    padding: "6px 10px",
                                                                    background: q.correct === key ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.02)",
                                                                    border: q.correct === key ? "1px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.08)",
                                                                    borderRadius: "6px",
                                                                    marginBottom: "4px",
                                                                    fontSize: "12px",
                                                                    color: q.correct === key ? "#d8b4fe" : "#9aa3c7",
                                                                    fontWeight: q.correct === key ? "600" : "400"
                                                                }}>
                                                                <span style={{ fontWeight: "700" }}>{key.toUpperCase()}:</span> {value} {q.correct === key && "✓"}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                        <button
                                                            onClick={() => startEdit(q)}
                                                            style={{
                                                                padding: "7px",
                                                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                fontWeight: "600",
                                                                fontSize: "11px",
                                                                cursor: "pointer",
                                                                transition: "all 0.3s"
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                                                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteQuestion(q.id)}
                                                            style={{
                                                                padding: "7px",
                                                                background: "rgba(255, 59, 48, 0.15)",
                                                                color: "#ff6b6b",
                                                                border: "1px solid rgba(255, 59, 48, 0.3)",
                                                                borderRadius: "6px",
                                                                fontWeight: "600",
                                                                fontSize: "11px",
                                                                cursor: "pointer",
                                                                transition: "all 0.3s"
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                                                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                        <button
                                                            onClick={() => moveQuestion(index, "up")}
                                                            disabled={index === 0}
                                                            style={{
                                                                padding: "7px",
                                                                background: index === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)",
                                                                color: index === 0 ? "#4b5563" : "#94a3b8",
                                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                borderRadius: "6px",
                                                                fontWeight: "600",
                                                                fontSize: "11px",
                                                                cursor: index === 0 ? "not-allowed" : "pointer",
                                                                transition: "all 0.3s",
                                                                opacity: index === 0 ? 0.5 : 1
                                                            }}
                                                            onMouseEnter={(e) => index !== 0 && (e.target.style.transform = "translateY(-2px)")}
                                                            onMouseLeave={(e) => index !== 0 && (e.target.style.transform = "translateY(0)")}
                                                        >
                                                            ↑
                                                        </button>
                                                        <button
                                                            onClick={() => moveQuestion(index, "down")}
                                                            disabled={index === questions.length - 1}
                                                            style={{
                                                                padding: "7px",
                                                                background: index === questions.length - 1 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)",
                                                                color: index === questions.length - 1 ? "#4b5563" : "#94a3b8",
                                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                borderRadius: "6px",
                                                                fontWeight: "600",
                                                                fontSize: "11px",
                                                                cursor: index === questions.length - 1 ? "not-allowed" : "pointer",
                                                                transition: "all 0.3s",
                                                                opacity: index === questions.length - 1 ? 0.5 : 1
                                                            }}
                                                            onMouseEnter={(e) => index !== questions.length - 1 && (e.target.style.transform = "translateY(-2px)")}
                                                            onMouseLeave={(e) => index !== questions.length - 1 && (e.target.style.transform = "translateY(0)")}
                                                        >
                                                            ↓
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .questions-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          [style*="position: sticky"] {
            position: relative !important;
            top: auto !important;
          }

          h1 {
            font-size: 28px !important;
          }
        }

        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #a855f7);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7c3aed, #d946ef);
        }
      `}</style>
        </div>
    );
}
