import { BrowserRouter, Routes, Route } from "react-router-dom";
import LeadForm from "./pages/LeadForm";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./component/ProtectedRoute";
import "./App.css";
import AdminLayout from "./pages/admin/AdminLayout";
import Quiz from "./component/Quiz";
import QuizComplete from "./component/QuizComplete";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeadForm />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/quiz-complete" element={<QuizComplete />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
