import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Loader from "../component/Loader";



export default function Dashboard() {
    const [users, setUsers] = useState({});
    const auth = getAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);


    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await signOut(auth);
            navigate("/admin", { replace: true });
        } catch (e) {
            console.error(e);
            setLoggingOut(false);
        }
    };

    useEffect(() => {
        onValue(ref(db, "XtremUser"), snap => {
            setUsers(snap.val() || {});
        });
    }, []);

    const giftUser = (id) => {
        update(ref(db, `XtremUser/${id}`), { isGifted: true });
    };

    if (loggingOut) {
        return <Loader text="Logging out..." />;
    }

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th><th>Mobile</th><th>Email</th>
                        <th>Company</th><th>Gift</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(users).map(([id, u]) => (
                        <tr key={id}>
                            <td>{u.name}</td>
                            <td>{u.mobile}</td>
                            <td>{u.email}</td>
                            <td>{u.companyName}</td>
                            <td>
                                {u.isGifted
                                    ? <button disabled>Gifted</button>
                                    : <button onClick={() => giftUser(id)}>
                                        Mark Gifted
                                    </button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
