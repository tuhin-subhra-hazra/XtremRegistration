import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Loader from "../component/Loader";

export default function ProtectedRoute({ children }) {
  const auth = getAuth();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (user === undefined) return <Loader text="Checking login..." />;
  if (!user) return <Navigate to="/admin" replace />;

  return children;
}

