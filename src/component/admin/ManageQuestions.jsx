import { useState, useEffect } from "react";
import { ref, set, remove, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function ManageQuestions() {
    const [questionType, setQuestionType] = useState("single"); // single, multiple, text, consent
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState([{ id: 1, text: "" }, { id: 2, text: "" }]);
    const [includeOther, setIncludeOther] = useState(false);
    const [consentText, setConsentText] = useState("");
    const [correct, setCorrect] = useState("");
    const [active, setActive] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        type: "single",
        question: "",
        options: [{ id: 1, text: "" }, { id: 2, text: "" }],
        includeOther: false,
        consentText: "",
        correct: "",
        active: true
    });
    const [showForm, setShowForm] = useState(false); // toggle visibility of new question form


    const addOption = () => {
        const newId = Math.max(...options.map(o => o.id), 0) + 1;
        setOptions([...options, { id: newId, text: "" }]);
    };

    const removeOption = (id) => {
        if (options.length > 1) {
            setOptions(options.filter(o => o.id !== id));
        }
    };

    const updateOption = (id, text) => {
        setOptions(options.map(o => o.id === id ? { ...o, text } : o));
    };

    const addEditOption = () => {
        const newId = Math.max(...editData.options.map(o => o.id), 0) + 1;
        setEditData({
            ...editData,
            options: [...editData.options, { id: newId, text: "" }]
        });
    };

    const removeEditOption = (id) => {
        if (editData.options.length > 1) {
            setEditData({
                ...editData,
                options: editData.options.filter(o => o.id !== id)
            });
        }
    };

    const updateEditOption = (id, text) => {
        setEditData({
            ...editData,
            options: editData.options.map(o => o.id === id ? { ...o, text } : o)
        });
    };

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
        if (questionType === "consent") {
            if (!consentText.trim()) {
                alert("Please enter consent text");
                return;
            }
        } else if (questionType === "text") {
            if (!question.trim()) {
                alert("Please enter the question");
                return;
            }
        } else {
            if (!question.trim()) {
                alert("Please enter the question");
                return;
            }
            if (options.some(o => !o.text.trim())) {
                alert("Please fill all options");
                return;
            }
        }

        setLoading(true);
        try {
            const qid = "q" + Date.now();
            const order = questions.length;
            const questionData = {
                type: questionType,
                order,
                active
            };

            if (questionType === "consent") {
                questionData.consentText = consentText;
            } else if (questionType === "text") {
                questionData.question = question;
            } else {
                questionData.question = question;
                questionData.options = options;
                questionData.includeOther = includeOther;
            }

            await set(ref(db, `quiz/quiz1/questions/${qid}`), questionData);
            alert("Question Saved ✅");

            // Reset form
            setQuestion("");
            setOptions([{ id: 1, text: "" }, { id: 2, text: "" }]);
            setIncludeOther(false);
            setConsentText("");
            setActive(true);
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
            type: q.type || "single",
            question: q.question || "",
            options: q.options && Array.isArray(q.options) ? [...q.options] : q.options ? Object.entries(q.options).map(([k, v], idx) => ({ id: idx + 1, text: v })) : [{ id: 1, text: "" }, { id: 2, text: "" }],
            includeOther: q.includeOther || false,
            consentText: q.consentText || "",
            correct: q.correct || "",
            active: q.active !== false
        });
    };

    const saveEditedQuestion = async () => {
        if (editData.type === "consent") {
            if (!editData.consentText.trim()) {
                alert("Please enter consent text");
                return;
            }
        } else if (editData.type === "text") {
            if (!editData.question.trim()) {
                alert("Please enter the question");
                return;
            }
        } else {
            if (!editData.question.trim()) {
                alert("Please enter the question");
                return;
            }
            if (editData.options.some(o => !o.text.trim())) {
                alert("Please fill all options");
                return;
            }
        }

        try {
            const questionByIdData = questions.find(q => q.id === editingId);
            const updateData = {
                type: editData.type,
                active: editData.active,
                order: questionByIdData?.order || 0
            };

            if (editData.type === "consent") {
                updateData.consentText = editData.consentText;
            } else if (editData.type === "text") {
                updateData.question = editData.question;
            } else {
                updateData.question = editData.question;
                updateData.options = editData.options;
                updateData.includeOther = editData.includeOther;
            }

            await set(ref(db, `quiz/quiz1/questions/${editingId}`), updateData);
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
            type: "single",
            question: "",
            options: [{ id: 1, text: "" }, { id: 2, text: "" }],
            includeOther: false,
            consentText: "",
            correct: "",
            active: true
        });
    };

    const toggleQuestionActive = async (id, currentActive) => {
        try {
            const question = questions.find(q => q.id === id);
            await set(ref(db, `quiz/quiz1/questions/${id}`), {
                ...question,
                active: !currentActive
            });
        } catch (error) {
            console.error("Error toggling question active status:", error);
            alert("Error updating question status");
        }
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
        <div id="q-main" style={{
            minHeight: "100vh",
            padding: "20px",
            paddingTop: "20px",
            background: "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.18), transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.18), transparent 50%), #0f172a",
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }
        
        }>
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
                    gridTemplateColumns: "1fr",
                    gap: "20px",
                    margin: "0"
                }} className="questions-grid">
                    {/* Toggle button */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: "12px 20px",
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            width: "fit-content",
                            margin: "0 auto"
                        }}
                    >
                        {showForm ? "Hide New Question" : "Add New Question"}
                    </button>

                    {showForm && (
                        <div>
                            <div style={{
                                background: "rgba(255, 255, 255, 0.06)",
                                backdropFilter: "blur(20px)",
                                padding: "clamp(20px, 5vw, 30px)",
                                borderRadius: "22px",
                                border: "1px solid rgba(255, 255, 255, 0.12)",
                                boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)"
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

                            {/* Question Type Selector */}
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#9aa3c7",
                                    marginBottom: "8px"
                                }}>
                                    Question Type
                                </label>
                                <select
                                    value={questionType}
                                    onChange={e => {
                                        setQuestionType(e.target.value);
                                        setQuestion("");
                                        setOptions([{ id: 1, text: "" }, { id: 2, text: "" }]);
                                        setIncludeOther(false);
                                        setConsentText("");
                                    }}
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
                                >
                                    <option value="single">Choose Option (Single)</option>
                                    <option value="multiple">Choose Option (Multiple)</option>
                                    <option value="text">Text Answer</option>
                                    <option value="consent">Consent</option>
                                </select>
                            </div>

                            {/* Question Text - Not for Consent */}
                            {questionType !== "consent" && (
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
                            )}

                            {/* Consent Text - Only for Consent */}
                            {questionType === "consent" && (
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: "#9aa3c7",
                                        marginBottom: "8px"
                                    }}>
                                        Consent Text
                                    </label>
                                    <textarea
                                        placeholder="Enter consent text here..."
                                        value={consentText}
                                        onChange={e => setConsentText(e.target.value)}
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
                                    <p style={{ color: "#9aa3c7", fontSize: "12px", marginTop: "8px" }}>
                                        Consent will have Yes/No buttons
                                    </p>
                                </div>
                            )}

                            {/* Options - Only for Single and Multiple */}
                            {(questionType === "single" || questionType === "multiple") && (
                                <div style={{ marginBottom: "20px" }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px"
                                    }}>
                                        <label style={{
                                            display: "block",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#9aa3c7"
                                        }}>
                                            Options
                                        </label>
                                        <button
                                            onClick={addOption}
                                            style={{
                                                padding: "4px 12px",
                                                background: "rgba(99, 102, 241, 0.2)",
                                                color: "#6366f1",
                                                border: "1px solid #6366f1",
                                                borderRadius: "6px",
                                                fontWeight: "600",
                                                fontSize: "11px",
                                                cursor: "pointer",
                                                transition: "all 0.3s"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "rgba(99, 102, 241, 0.4)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "rgba(99, 102, 241, 0.2)";
                                            }}
                                        >
                                            + Add Option
                                        </button>
                                    </div>

                                    {options.map((opt, idx) => (
                                        <div key={opt.id} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                                            <input
                                                placeholder={`Option ${idx + 1}`}
                                                value={opt.text}
                                                onChange={e => updateOption(opt.id, e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: "10px 12px",
                                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                                    borderRadius: "10px",
                                                    background: "rgba(0, 0, 0, 0.35)",
                                                    color: "#fff",
                                                    fontSize: "13px",
                                                    boxSizing: "border-box",
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
                                            {options.length > 1 && (
                                                <button
                                                    onClick={() => removeOption(opt.id)}
                                                    style={{
                                                        padding: "8px 12px",
                                                        background: "rgba(255, 59, 48, 0.15)",
                                                        color: "#ff6b6b",
                                                        border: "1px solid rgba(255, 59, 48, 0.3)",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        fontSize: "13px",
                                                        fontWeight: "600",
                                                        transition: "all 0.3s"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                                                    onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "12px",
                                        background: "rgba(99, 102, 241, 0.1)",
                                        border: "1px solid rgba(99, 102, 241, 0.3)",
                                        borderRadius: "10px",
                                        marginTop: "12px"
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={includeOther}
                                            onChange={e => setIncludeOther(e.target.checked)}
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                cursor: "pointer",
                                                accentColor: "#6366f1"
                                            }}
                                        />
                                        <label style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#9aa3c7",
                                            cursor: "pointer",
                                            margin: 0
                                        }}>
                                            Include "Other" with text field
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px",
                                background: "rgba(99, 102, 241, 0.1)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                borderRadius: "10px",
                                marginBottom: "20px"
                            }}>
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={e => setActive(e.target.checked)}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer",
                                        accentColor: "#6366f1"
                                    }}
                                />
                                <label style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#9aa3c7",
                                    cursor: "pointer",
                                    margin: 0
                                }}>
                                    Active Question
                                </label>
                            </div>

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
                    )}

                    {/* Right Column - Questions List */}
                    <div>
                        <div style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            backdropFilter: "blur(20px)",
                            padding: "clamp(20px, 5vw, 30px)",
                            borderRadius: "22px",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)",
                            display: "flex",
                            flexDirection: "column"
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
                                    paddingRight: "8px",
                                    flex: 1,
                                    overflowY: "auto"
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
                                                        marginBottom: "8px"
                                                    }}>
                                                        Type: {editData.type === "single" && "Single Choice"} {editData.type === "multiple" && "Multiple Choice"} {editData.type === "text" && "Text Answer"} {editData.type === "consent" && "Consent"}
                                                    </label>

                                                    {editData.type !== "consent" && (
                                                        <>
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
                                                        </>
                                                    )}

                                                    {editData.type === "consent" && (
                                                        <>
                                                            <label style={{
                                                                display: "block",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                color: "#9aa3c7",
                                                                marginBottom: "6px"
                                                            }}>
                                                                Consent Text
                                                            </label>
                                                            <textarea
                                                                value={editData.consentText}
                                                                onChange={e => setEditData({ ...editData, consentText: e.target.value })}
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
                                                        </>
                                                    )}

                                                    {(editData.type === "single" || editData.type === "multiple") && (
                                                        <>
                                                            <label style={{
                                                                display: "block",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                color: "#9aa3c7",
                                                                marginBottom: "6px"
                                                            }}>
                                                                Options
                                                            </label>
                                                            {editData.options.map((opt, idx) => (
                                                                <div key={opt.id} style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
                                                                    <input
                                                                        placeholder={`Option ${idx + 1}`}
                                                                        value={opt.text}
                                                                        onChange={e => updateEditOption(opt.id, e.target.value)}
                                                                        style={{
                                                                            flex: 1,
                                                                            padding: "6px 10px",
                                                                            border: "1px solid #a855f7",
                                                                            borderRadius: "6px",
                                                                            background: "rgba(0, 0, 0, 0.35)",
                                                                            color: "#fff",
                                                                            fontSize: "11px",
                                                                            boxSizing: "border-box",
                                                                            outline: "none"
                                                                        }}
                                                                    />
                                                                    {editData.options.length > 1 && (
                                                                        <button
                                                                            onClick={() => removeEditOption(opt.id)}
                                                                            style={{
                                                                                padding: "4px 8px",
                                                                                background: "rgba(255, 59, 48, 0.15)",
                                                                                color: "#ff6b6b",
                                                                                border: "1px solid rgba(255, 59, 48, 0.3)",
                                                                                borderRadius: "6px",
                                                                                cursor: "pointer",
                                                                                fontSize: "11px",
                                                                                fontWeight: "600",
                                                                                transition: "all 0.3s"
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={addEditOption}
                                                                style={{
                                                                    width: "100%",
                                                                    padding: "6px",
                                                                    background: "rgba(99, 102, 241, 0.2)",
                                                                    color: "#6366f1",
                                                                    border: "1px solid #6366f1",
                                                                    borderRadius: "6px",
                                                                    fontWeight: "600",
                                                                    fontSize: "10px",
                                                                    cursor: "pointer",
                                                                    marginBottom: "10px",
                                                                    transition: "all 0.3s"
                                                                }}
                                                            >
                                                                + Add Option
                                                            </button>
                                                            <div style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px",
                                                                padding: "8px",
                                                                background: "rgba(168, 85, 247, 0.1)",
                                                                border: "1px solid rgba(168, 85, 247, 0.3)",
                                                                borderRadius: "8px",
                                                                marginBottom: "10px"
                                                            }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editData.includeOther}
                                                                    onChange={e => setEditData({ ...editData, includeOther: e.target.checked })}
                                                                    style={{
                                                                        width: "14px",
                                                                        height: "14px",
                                                                        cursor: "pointer",
                                                                        accentColor: "#a855f7"
                                                                    }}
                                                                />
                                                                <label style={{
                                                                    fontSize: "10px",
                                                                    fontWeight: "600",
                                                                    color: "#d8b4fe",
                                                                    cursor: "pointer",
                                                                    margin: 0
                                                                }}>
                                                                    Include "Other"
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                        padding: "8px",
                                                        background: "rgba(168, 85, 247, 0.1)",
                                                        border: "1px solid rgba(168, 85, 247, 0.3)",
                                                        borderRadius: "8px",
                                                        marginBottom: "12px"
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={editData.active}
                                                            onChange={e => setEditData({ ...editData, active: e.target.checked })}
                                                            style={{
                                                                width: "16px",
                                                                height: "16px",
                                                                cursor: "pointer",
                                                                accentColor: "#a855f7"
                                                            }}
                                                        />
                                                        <label style={{
                                                            fontSize: "11px",
                                                            fontWeight: "600",
                                                            color: "#d8b4fe",
                                                            cursor: "pointer",
                                                            margin: 0
                                                        }}>
                                                            Active
                                                        </label>
                                                    </div>

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
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                        marginBottom: "10px"
                                                    }}>
                                                        <div style={{
                                                            fontSize: "20px",
                                                            color: "#F6EB61",
                                                            fontWeight: "600"
                                                        }}>
                                                            Q{index + 1} ({q.type === "single" ? "Single" : q.type === "multiple" ? "Multiple" : q.type === "text" ? "Text" : q.type === "consent" ? "Consent" : "Legacy"})
                                                        </div>
                                                        
                                                        {/* Active/Inactive Toggle Switch */}
                                                        <label style={{
                                                            position: "relative",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            cursor: "pointer"
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={q.active !== false}
                                                                onChange={() => toggleQuestionActive(q.id, q.active !== false)}
                                                                style={{
                                                                    appearance: "none",
                                                                    width: "50px",
                                                                    height: "28px",
                                                                    background: q.active !== false ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)",
                                                                    border: q.active !== false ? "2px solid #22c55e" : "2px solid #ef4444",
                                                                    borderRadius: "20px",
                                                                    cursor: "pointer",
                                                                    outline: "none",
                                                                    transition: "all 0.3s",
                                                                    position: "relative",
                                                                    padding: 0,
                                                                    margin: 0
                                                                }}
                                                            />
                                                            <span style={{
                                                                position: "absolute",
                                                                left: q.active !== false ? "26px" : "4px",
                                                                width: "20px",
                                                                height: "20px",
                                                                background: q.active !== false ? "#22c55e" : "#ef4444",
                                                                borderRadius: "50%",
                                                                transition: "left 0.3s",
                                                                pointerEvents: "none"
                                                            }} />
                                                            <span style={{
                                                                position: "absolute",
                                                                left: q.active !== false ? "32px" : "10px",
                                                                fontSize: "12px",
                                                                fontWeight: "700",
                                                                color: "#fff",
                                                                pointerEvents: "none",
                                                                transition: "left 0.3s"
                                                            }}>
                                                                {q.active !== false ? "✓" : "✕"}
                                                            </span>
                                                        </label>
                                                    </div>

                                                    {q.type === "consent" ? (
                                                        <div>
                                                            <div style={{
                                                                fontWeight: "600",
                                                                color: "#fff",
                                                                fontSize: "clamp(12px, 2vw, 14px)",
                                                                lineHeight: "1.5",
                                                                marginBottom: "10px",
                                                                padding: "10px",
                                                                background: "rgba(168, 85, 247, 0.1)",
                                                                borderRadius: "6px"
                                                            }}>
                                                                {q.consentText}
                                                            </div>
                                                            <div style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "1fr 1fr",
                                                                gap: "8px",
                                                                marginBottom: "12px"
                                                            }}>
                                                                <button style={{
                                                                    padding: "8px",
                                                                    background: "rgba(34, 197, 94, 0.15)",
                                                                    color: "#22c55e",
                                                                    border: "1px solid #22c55e",
                                                                    borderRadius: "6px",
                                                                    fontWeight: "600",
                                                                    fontSize: "12px",
                                                                    cursor: "pointer"
                                                                }}>
                                                                    Yes
                                                                </button>
                                                                <button style={{
                                                                    padding: "8px",
                                                                    background: "rgba(239, 68, 68, 0.15)",
                                                                    color: "#ef4444",
                                                                    border: "1px solid #ef4444",
                                                                    borderRadius: "6px",
                                                                    fontWeight: "600",
                                                                    fontSize: "12px",
                                                                    cursor: "pointer"
                                                                }}>
                                                                    No
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : q.type === "text" ? (
                                                        <div>
                                                            <div style={{
                                                                fontWeight: "600",
                                                                color: "#fff",
                                                                fontSize: "clamp(12px, 2vw, 14px)",
                                                                lineHeight: "1.5",
                                                                marginBottom: "10px"
                                                            }}>
                                                                {q.question}
                                                            </div>
                                                            <div style={{
                                                                padding: "10px",
                                                                background: "rgba(99, 102, 241, 0.15)",
                                                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                                                borderRadius: "6px",
                                                                fontSize: "12px",
                                                                color: "#9aa3c7",
                                                                fontStyle: "italic",
                                                                marginBottom: "12px"
                                                            }}>
                                                                ✎ Text response (no fixed options)
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
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
                                                                {q.options && Array.isArray(q.options) && q.options.map((opt, index) => (
                                                                    <div
                                                                        key={opt.id}
                                                                        style={{
                                                                            padding: "6px 10px",
                                                                            background: "rgba(255, 255, 255, 0.02)",
                                                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                            borderRadius: "6px",
                                                                            marginBottom: "4px",
                                                                            fontSize: "12px",
                                                                            color: "#9aa3c7",
                                                                            fontWeight: "400"
                                                                        }}>
                                                                        {index + 1}. {opt.text}
                                                                    </div>
                                                                ))}
                                                                {q.options && !Array.isArray(q.options) && Object.entries(q.options).map(([key, value]) => (
                                                                    <div
                                                                        key={key}
                                                                        style={{
                                                                            padding: "6px 10px",
                                                                            background: "rgba(255, 255, 255, 0.02)",
                                                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                            borderRadius: "6px",
                                                                            marginBottom: "4px",
                                                                            fontSize: "12px",
                                                                            color: "#9aa3c7",
                                                                            fontWeight: "400"
                                                                        }}>
                                                                        {index + 1}. {value}
                                                                    </div>
                                                                ))}
                                                                {q.includeOther && (
                                                                    <div
                                                                        style={{
                                                                            padding: "6px 10px",
                                                                            background: "rgba(255, 255, 255, 0.02)",
                                                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                            borderRadius: "6px",
                                                                            marginBottom: "4px",
                                                                            fontSize: "12px",
                                                                            color: "#9aa3c7",
                                                                            fontWeight: "400"
                                                                        }}>
                                                                        {q.options.length + 1}. Other: _____________
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
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
                                                                padding: "2px",
                                                                background: index === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)",
                                                                color: index === 0 ? "#4b5563" : "#ffffff",
                                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                borderRadius: "6px",
                                                                fontWeight: "800",
                                                                fontSize: "20px",
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
                                                                padding: "2px",
                                                                background: index === questions.length - 1 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)",
                                                                color: index === questions.length - 1 ? "#4b5563" : "#ffffff",
                                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                borderRadius: "6px",
                                                                fontWeight: "800",
                                                                fontSize: "20px",
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

          #q-main {
            padding: 20px 0px !important;
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
