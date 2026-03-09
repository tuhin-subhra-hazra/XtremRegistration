import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ref, get, set } from "firebase/database";
import { db } from "../firebase";
import "../App.css";
import Loader from "./Loader";
import ProductHeader from "./ProductHeader";

export default function Quiz() {
    const { quizId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const userId = state?.userId;

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});

    useEffect(() => {
        if (!userId) {
            navigate("/");
            return;
        }

        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const snapshot = await get(ref(db, `quiz/${quizId}/questions`));
        if (snapshot.exists()) {
            const data = snapshot.val();

            // convert object → array
            const formatted = Object.entries(data).map(([id, value]) => ({
                id,
                ...value
            }));

            // Filter only active questions
            const activeQuestions = formatted.filter(q => q.active !== false);

            // Sort by order field if it exists, otherwise keep original order
            const sorted = activeQuestions.sort((a, b) => {
                return (a.order || 0) - (b.order || 0);
            });

            // sanitize options to avoid nested objects
            const sanitized = sorted.map(q => {
                if (q.options) {
                    if (Array.isArray(q.options)) {
                        q.options = q.options.map(opt => {
                            if (opt && typeof opt.text === "object") {
                                return { ...opt, text: opt.text.text || JSON.stringify(opt.text) };
                            }
                            return opt;
                        });
                    } else if (typeof q.options === "object") {
                        // object-of-values; convert inner objects to strings if necessary
                        const cleanObj = {};
                        Object.entries(q.options).forEach(([k, v]) => {
                            if (v && typeof v === "object") {
                                cleanObj[k] = v.text || JSON.stringify(v);
                            } else {
                                cleanObj[k] = v;
                            }
                        });
                        q.options = cleanObj;
                    }
                }
                return q;
            });

            setQuestions(sanitized);
        }
        setLoading(false);
    };

    const handleOptionClick = async (optionKey) => {
        const currentQuestion = questions[currentIndex];
        if (!currentQuestion) return;

        // Store the selected answer locally
        const newAnswers = { ...selectedAnswers, [currentQuestion.id]: optionKey };
        setSelectedAnswers(newAnswers);

        // Save answer to database (guard against missing identifiers)
        if (!quizId || !userId) {
            console.error("Unable to save answer, quizId or userId missing", { quizId, userId });
            return;
        }
        const path = `answers/${quizId}/${userId}/${currentQuestion.id}`;
        try {
            await set(ref(db, path), optionKey);
            console.log("saved answer to", path, optionKey);
        } catch (err) {
            console.error("Failed to save answer", path, err);
        }
    };

    const handleMultipleChoiceClick = async (optionKey) => {
        const currentQuestion = questions[currentIndex];
        if (!currentQuestion) return;
        const currentSelection = selectedAnswers[currentQuestion.id] || [];
        
        // Toggle the option in the array
        let newSelection;
        if (Array.isArray(currentSelection)) {
            if (currentSelection.includes(optionKey)) {
                newSelection = currentSelection.filter(item => item !== optionKey);
            } else {
                newSelection = [...currentSelection, optionKey];
            }
        } else {
            newSelection = [optionKey];
        }
        
        // Store the selected answers locally
        const newAnswers = { ...selectedAnswers, [currentQuestion.id]: newSelection };
        setSelectedAnswers(newAnswers);

        // Save answers array to database
        if (!quizId || !userId) {
            console.error("Unable to save multiple choice answer, missing ids", { quizId, userId });
            return;
        }
        const path = `answers/${quizId}/${userId}/${currentQuestion.id}`;
        try {
            await set(ref(db, path), newSelection);
            console.log("saved multiple answer to", path, newSelection);
        } catch (err) {
            console.error("Failed to save multiple choice answer", path, err);
        }
    };

    const saveTextAnswer = async (questionId, textValue) => {
        // Save text answer to database
        await set(
            ref(db, `answers/${quizId}/${userId}/${questionId}`),
            textValue
        );
    };

    const handleNext = () => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmitQuiz = () => {
        navigate("/quiz-complete");
    };

    if (loading) return <Loader text="Loading quiz..." />;

    if (questions.length === 0) return <p style={{ textAlign: "center", color: "#9aa3c7", marginTop: "60px" }}>No questions available</p>;

    // Show start screen
    if (!quizStarted) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: "linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                padding: "20px" 
            }}>
                <div style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "22px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)",
                    padding: "clamp(40px, 8vw, 60px) clamp(30px, 6vw, 50px)",
                    color: "#fff",
                    textAlign: "center",
                    maxWidth: "600px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                    alignItems: "center"
                }}>
                    {/* Icon/Emoji */}
                    <div style={{ fontSize: "80px", animation: "pulse 2s infinite" }}>
                        🚀
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: "clamp(28px, 6vw, 48px)",
                        fontWeight: "700",
                        background: "linear-gradient(to right, #6366f1, #a855f7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: "0",
                        lineHeight: "1.2"
                    }}>
                        Let's Start the Quiz!
                    </h1>

                    {/* Description */}
                    <p style={{
                        fontSize: "clamp(14px, 3vw, 16px)",
                        color: "#9aa3c7",
                        margin: "0",
                        lineHeight: "1.6",
                        maxWidth: "500px"
                    }}>
                        Get ready to test your knowledge! You'll be asked <span style={{ fontWeight: "600", color: "#d8b4fe" }}>{questions.length} questions</span>. 
                        Each question is important, so read carefully and select the best answer.
                    </p>

                    {/* Stats */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        width: "100%",
                        maxWidth: "400px"
                    }}>
                        <div style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            borderRadius: "12px",
                            padding: "20px",
                            backdropFilter: "blur(10px)"
                        }}>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#6366f1", marginBottom: "5px" }}>
                                {questions.length}
                            </div>
                            <div style={{ fontSize: "12px", color: "#9aa3c7", fontWeight: "500" }}>
                                Total Questions
                            </div>
                        </div>
                        <div style={{
                            background: "rgba(168, 85, 247, 0.15)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "12px",
                            padding: "20px",
                            backdropFilter: "blur(10px)"
                        }}>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#a855f7", marginBottom: "5px" }}>
                                ∞
                            </div>
                            <div style={{ fontSize: "12px", color: "#9aa3c7", fontWeight: "500" }}>
                                No Time Limit
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => setQuizStarted(true)}
                        style={{
                            padding: "clamp(12px, 3vw, 16px) clamp(30px, 6vw, 50px)",
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "clamp(14px, 3vw, 16px)",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
                            marginTop: "10px",
                            width: "100%",
                            maxWidth: "300px"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-3px)";
                            e.target.style.boxShadow = "0 15px 40px rgba(99, 102, 241, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 10px 30px rgba(99, 102, 241, 0.3)";
                        }}
                    >
                        Start Quiz →
                    </button>

                    {/* Footer Note */}
                    <p style={{
                        fontSize: "12px",
                        color: "#4b5563",
                        margin: "0",
                        marginTop: "10px"
                    }}>
                        ✓ You can review your answers before submitting
                    </p>
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.1); }
                    }
                `}</style>
            </div>
        );
    }

    const q = questions[currentIndex];

    // helper to safely render option text or id
    const renderValue = (val) => {
        if (val == null) return "";
        if (typeof val === "object") {
            // if object has text property, use that
            if ("text" in val) return String(val.text);
            if ("id" in val) return String(val.id);
            return JSON.stringify(val);
        }
        return String(val);
    };

    // Handle different question types
    const isConsent = q.type === "consent";
    const isText = q.type === "text";
    const isSingleChoice = q.type === "single" || !q.type; // Default to single if no type
    const isMultipleChoice = q.type === "multiple";
    
    // Check if question is answered
    const answer = selectedAnswers[q.id];
    const isAnswered = isMultipleChoice 
        ? Array.isArray(answer) && answer.length > 0
        : answer;

    return (
        <div>
            <ProductHeader />
            <div className="quiz-container">
            <h1 className="quiz-title">Quiz Time!</h1>
            <br />
            {/* Progress Bar */}
            <div className="progressWrapper">
                <div className="progressBar"
                    style={{
                        width: `${((currentIndex) / questions.length) * 100}%`
                    }}
                />
            </div>

            <span className="badge">
                Question {currentIndex + 1} of {questions.length}
            </span>
            <br />
            <br />

            <div className="quiz-card">
                <h2 className="questionText">
                    {isConsent ? "📋 Consent" : `Question ${currentIndex + 1}`}: {q.question || q.consentText}
                </h2>
                
                {isConsent ? (
                    // Consent Question
                    <div className="optionsGrid">
                        <button
                            onClick={() => handleOptionClick("yes")}
                            style={{
                                padding: "20px",
                                background: selectedAnswers[q.id] === "yes" ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.1)",
                                color: "#22c55e",
                                border: `2px solid ${selectedAnswers[q.id] === "yes" ? "#22c55e" : "rgba(34, 197, 94, 0.2)"}`,
                                borderRadius: "10px",
                                fontWeight: "600",
                                fontSize: "18px",
                                cursor: "pointer",
                                transition: "all 0.3s"
                            }}
                            className={`optionButton ${selectedAnswers[q.id] === "yes" ? 'selected' : ''}`}
                        >
                            ✓ Yes, I Agree
                        </button>
                        <button
                            onClick={() => handleOptionClick("no")}
                            style={{
                                padding: "20px",
                                background: selectedAnswers[q.id] === "no" ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.1)",
                                color: "#ef4444",
                                border: `2px solid ${selectedAnswers[q.id] === "no" ? "#ef4444" : "rgba(239, 68, 68, 0.2)"}`,
                                borderRadius: "10px",
                                fontWeight: "600",
                                fontSize: "18px",
                                cursor: "pointer",
                                transition: "all 0.3s"
                            }}
                            className={`optionButton ${selectedAnswers[q.id] === "no" ? 'selected' : ''}`}
                        >
                            ✕ No, I Disagree
                        </button>
                    </div>
                ) : isText ? (
                    // Text Answer Question
                    <div style={{ marginTop: "20px" }}>
                        <textarea
                            placeholder="Type your answer here..."
                            value={selectedAnswers[q.id] || ""}
                            onChange={(e) => {
                                const newAnswers = { ...selectedAnswers, [q.id]: e.target.value };
                                setSelectedAnswers(newAnswers);
                                // Save text answer to database
                                saveTextAnswer(q.id, e.target.value);
                            }}
                            style={{
                                width: "100%",
                                minHeight: "120px",
                                padding: "15px",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                borderRadius: "10px",
                                background: "rgba(0, 0, 0, 0.3)",
                                color: "#fff",
                                fontSize: "14px",
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                ) : (
                    // Single/Multiple Choice Questions
                    <div className="optionsGrid">
                        {q.options && Array.isArray(q.options) ? (
                            // New format: array of options
                            q.options.map((opt) => {
                                const optionKey = renderValue(opt.id);
                                const isMultiple = isMultipleChoice;
                                const currentSelection = selectedAnswers[q.id] || (isMultiple ? [] : null);
                                const isSelected = isMultiple
                                    ? Array.isArray(currentSelection) && currentSelection.includes(optionKey)
                                    : currentSelection === optionKey;
                                
                                return (
                                    <button
                                        key={optionKey}
                                        onClick={() => isMultiple ? handleMultipleChoiceClick(optionKey) : handleOptionClick(optionKey)}
                                        className={`optionButton ${isSelected ? 'selected' : ''}`}
                                        style={isSelected ? {
                                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                            borderColor: "#a855f7"
                                        } : {}}
                                    >
                                        <div className="optionContent">
                                            {isMultiple && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    style={{
                                                        marginRight: "8px",
                                                        width: "18px",
                                                        height: "18px",
                                                        cursor: "pointer",
                                                        accentColor: "#a855f7"
                                                    }}
                                                />
                                            )}
                                            <span className="keyIndicator">{renderValue(opt.id)}</span>
                                            <span className="text">{renderValue(opt.text)}</span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : q.options && typeof q.options === "object" ? (
                            // Old format: object with keys
                            Object.entries(q.options).map(([key, value]) => {
                                const isMultiple = isMultipleChoice;
                                const currentSelection = selectedAnswers[q.id] || (isMultiple ? [] : null);
                                const optKey = renderValue(key);
                                const optVal = renderValue(value);
                                const isSelected = isMultiple
                                    ? Array.isArray(currentSelection) && currentSelection.includes(optKey)
                                    : currentSelection === optKey;
                                
                                return (
                                    <button
                                        key={optKey}
                                        onClick={() => isMultiple ? handleMultipleChoiceClick(optKey) : handleOptionClick(optKey)}
                                        className={`optionButton ${isSelected ? 'selected' : ''}`}
                                        style={isSelected ? {
                                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                            borderColor: "#a855f7"
                                        } : {}}
                                    >
                                        <div className="optionContent">
                                            {isMultiple && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    style={{
                                                        marginRight: "8px",
                                                        width: "18px",
                                                        height: "18px",
                                                        cursor: "pointer",
                                                        accentColor: "#a855f7"
                                                    }}
                                                />
                                            )}
                                            <span className="keyIndicator">{optKey.toUpperCase()}</span>
                                            <span className="text">{optVal}</span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : null}
                        {q.includeOther && (
                            <div style={{
                                marginTop: "15px",
                                padding: "15px",
                                background: "rgba(99, 102, 241, 0.1)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                borderRadius: "10px"
                            }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#9aa3c7", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={
                                            isMultipleChoice
                                                ? Array.isArray(selectedAnswers[q.id]) && selectedAnswers[q.id].some(v => v.startsWith("other"))
                                                : typeof selectedAnswers[q.id] === "string" && selectedAnswers[q.id].startsWith("other")
                                        }
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            if (isMultipleChoice) {
                                                const curr = Array.isArray(selectedAnswers[q.id]) ? [...selectedAnswers[q.id]] : [];
                                                let newSelection = curr.filter(v => !v.startsWith("other"));
                                                if (checked) newSelection.push("other");
                                                const newAnswers = { ...selectedAnswers, [q.id]: newSelection };
                                                setSelectedAnswers(newAnswers);
                                                set(ref(db, `answers/${quizId}/${userId}/${q.id}`), newSelection);
                                            } else {
                                                if (checked) {
                                                    const newAnswers = { ...selectedAnswers, [q.id]: "other" };
                                                    setSelectedAnswers(newAnswers);
                                                    set(ref(db, `answers/${quizId}/${userId}/${q.id}`), "other");
                                                } else {
                                                    const newAnswers = { ...selectedAnswers };
                                                    delete newAnswers[q.id];
                                                    setSelectedAnswers(newAnswers);
                                                    set(ref(db, `answers/${quizId}/${userId}/${q.id}`), null);
                                                }
                                            }
                                        }}
                                        style={{ cursor: "pointer", accentColor: "#6366f1" }}
                                    />
                                    Other:
                                </label>
                                {(isMultipleChoice
                                    ? Array.isArray(selectedAnswers[q.id]) && selectedAnswers[q.id].some(v => v.startsWith("other"))
                                    : typeof selectedAnswers[q.id] === "string" && selectedAnswers[q.id].startsWith("other")) && (
                                    <input
                                        type="text"
                                        placeholder="Please specify..."
                                        onChange={(e) => {
                                            const value = `other: ${e.target.value}`;
                                            if (isMultipleChoice) {
                                                const curr = Array.isArray(selectedAnswers[q.id]) ? [...selectedAnswers[q.id]] : [];
                                                const idx = curr.findIndex(v => v.startsWith("other"));
                                                if (idx >= 0) curr[idx] = value;
                                                else curr.push(value);
                                                const newAnswers = { ...selectedAnswers, [q.id]: curr };
                                                setSelectedAnswers(newAnswers);
                                                set(ref(db, `answers/${quizId}/${userId}/${q.id}`), curr);
                                            } else {
                                                const newAnswers = { ...selectedAnswers, [q.id]: value };
                                                setSelectedAnswers(newAnswers);
                                                set(ref(db, `answers/${quizId}/${userId}/${q.id}`), value);
                                            }
                                        }}
                                        style={{
                                            width: "100%",
                                            marginTop: "10px",
                                            padding: "10px",
                                            border: "1px solid rgba(99, 102, 241, 0.3)",
                                            borderRadius: "8px",
                                            background: "rgba(0, 0, 0, 0.3)",
                                            color: "#fff",
                                            outline: "none"
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "30px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        style={{
                            padding: "12px 24px",
                            background: currentIndex === 0 ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.2)",
                            color: currentIndex === 0 ? "#4b5563" : "#6366f1",
                            border: `1px solid ${currentIndex === 0 ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.3)"}`,
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                            transition: "all 0.3s",
                            opacity: currentIndex === 0 ? 0.5 : 1,
                            minWidth: "120px"
                        }}
                        onMouseEnter={(e) => currentIndex > 0 && (e.target.style.background = "rgba(99, 102, 241, 0.3)")}
                        onMouseLeave={(e) => currentIndex > 0 && (e.target.style.background = "rgba(99, 102, 241, 0.2)")}
                    >
                        ← Previous
                    </button>

                    {currentIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!isAnswered}
                            style={{
                                padding: "12px 24px",
                                background: isAnswered ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255, 255, 255, 0.1)",
                                color: isAnswered ? "#fff" : "#4b5563",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: isAnswered ? "pointer" : "not-allowed",
                                transition: "all 0.3s",
                                minWidth: "120px",
                                boxShadow: isAnswered ? "0 5px 15px rgba(34, 197, 94, 0.3)" : "none",
                                opacity: isAnswered ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => {
                                if (isAnswered) {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 8px 20px rgba(34, 197, 94, 0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isAnswered) {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 5px 15px rgba(34, 197, 94, 0.3)";
                                }
                            }}
                        >
                            Submit Quiz ✓
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!isAnswered}
                            style={{
                                padding: "12px 24px",
                                background: isAnswered ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255, 255, 255, 0.1)",
                                color: isAnswered ? "#fff" : "#4b5563",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: isAnswered ? "pointer" : "not-allowed",
                                transition: "all 0.3s",
                                minWidth: "120px",
                                boxShadow: isAnswered ? "0 5px 15px rgba(99, 102, 241, 0.3)" : "none",
                                opacity: isAnswered ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => {
                                if (isAnswered) {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isAnswered) {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 5px 15px rgba(99, 102, 241, 0.3)";
                                }
                            }}
                        >
                            Next →
                        </button>
                    )}
                </div>

                {/* Answer Status Indicator */}
                {isAnswered && (
                    <div style={{
                        textAlign: "center",
                        marginTop: "20px",
                        padding: "10px 16px",
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "8px",
                        color: "#22c55e",
                        fontSize: "13px",
                        fontWeight: "600"
                    }}>
                        ✓ Answer Saved
                    </div>
                )}
            </div>
        </div>
        </div>
    );




}