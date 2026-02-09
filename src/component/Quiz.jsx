import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ref, get, set } from "firebase/database";
import { db } from "../firebase";

export default function Quiz() {
  const { quizId } = useParams(); // quiz1
  const { state } = useLocation();
  const navigate = useNavigate();

  const userId = state?.userId;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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

      setQuestions(formatted);
    }
    setLoading(false);
  };

  const handleOptionClick = async (optionKey) => {
    const currentQuestion = questions[currentIndex];

    // save answer
    await set(
      ref(db, `answers/${quizId}/${userId}/${currentQuestion.id}`),
      optionKey
    );

    // next question
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/quiz-complete");
    }
  };

  if (loading) return <p>Loading quiz...</p>;

  if (questions.length === 0) return <p>No questions available</p>;

  const q = questions[currentIndex];

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h3>
        Question {currentIndex + 1} / {questions.length}
      </h3>

      <h2>{q.question}</h2>

      <div style={{ marginTop: "20px" }}>
        {Object.entries(q.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleOptionClick(key)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer"
            }}
          >
            {key.toUpperCase()}. {value}
          </button>
        ))}
      </div>
    </div>
  );
}
