import { useState } from "react";
import { ref, set } from "firebase/database";
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

  const saveQuestion = async () => {
    const qid = "q" + Date.now(); // auto unique id

    await set(ref(db, `quiz/quiz1/questions/${qid}`), {
      question,
      options,
      correct
    });

    alert("Question Saved ✅");

    // reset
    setQuestion("");
    setOptions({ a: "", b: "", c: "", d: "" });
    setCorrect("");
  };

  return (
    <div>
      <h2>Manage Questions</h2>

      <div style={{ maxWidth: "500px" }}>
        <input
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        {["a", "b", "c", "d"].map(key => (
          <input
            key={key}
            placeholder={`Option ${key.toUpperCase()}`}
            value={options[key]}
            onChange={e =>
              setOptions({ ...options, [key]: e.target.value })
            }
            style={{ width: "100%", marginBottom: "10px" }}
          />
        ))}

        <select
          value={correct}
          onChange={e => setCorrect(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value="">Select Correct Answer</option>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
          <option value="c">Option C</option>
          <option value="d">Option D</option>
        </select>

        <button onClick={saveQuestion}>Save Question</button>
      </div>
    </div>
  );
}
