import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Loader from "../component/Loader";


export default function AdminLogin() {
    const [error, setError] = useState("");
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);


    const login = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(
                auth,
                e.target.email.value,
                e.target.password.value
            );
            nav("/dashboard", { replace: true });
        } catch {
            setError("Invalid login");
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Logging in..." />;


    return (
        <div className="form-container">
            <div className="header">
                <h2>Admin Login</h2>
                <p>Enter your credentials to access the dashboard.</p>
            </div>

            <form onSubmit={login} className="form-grid" >
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="form-group">
                    <label>Username</label>
                    <input type="email" name="email" placeholder="Username" required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" id="password" name="password" placeholder="Password" required />
                </div>
                <div className="show-password">
                    <input type="checkbox" id="togglePassword" onChange={(e) => {
                        const passwordInput = document.getElementById("password");
                        if (e.target.checked) {
                            passwordInput.type = "text";
                        } else {
                            passwordInput.type = "password";
                        }
                    }} />
                    <label htmlFor="togglePassword">Show password</label>
                </div>
                <button type="submit" id="loginBtn">
                    <span id="btnText">Login</span>
                    <span id="loader" className="spinner hidden"></span>
                </button>
            </form>
        </div>
    );
}
