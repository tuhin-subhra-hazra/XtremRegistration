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
        <form onSubmit={login}>
            {error && <p>{error}</p>}
            <input name="email" placeholder="Admin Email" />
            <input name="password" type="password" placeholder="Password" />
            <button>Login</button>
        </form>
    );
}
