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

            setQuestions(sorted);
        }
        setLoading(false);
    };

    const handleOptionClick = async (optionKey) => {
        const currentQuestion = questions[currentIndex];
        
        // Store the selected answer locally
        const newAnswers = { ...selectedAnswers, [currentQuestion.id]: optionKey };
        setSelectedAnswers(newAnswers);

        // Save answer to database
        await set(
            ref(db, `answers/${quizId}/${userId}/${currentQuestion.id}`),
            optionKey
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
    const isAnswered = selectedAnswers[q.id];

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
                <h2 className="questionText">{q.question}</h2>
                <div className="optionsGrid">
                    {Object.entries(q.options).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleOptionClick(key)}
                            className={`optionButton ${selectedAnswers[q.id] === key ? 'selected' : ''}`}
                            style={selectedAnswers[q.id] === key ? {
                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                borderColor: "#a855f7"
                            } : {}}
                        >
                            <div className="optionContent">
                                <span className="keyIndicator">{key.toUpperCase()}</span>
                                <span className="text">{value}</span>
                            </div>
                        </button>
                    ))}
                </div>

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