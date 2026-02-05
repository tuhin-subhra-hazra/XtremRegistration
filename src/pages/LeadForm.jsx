import { ref, push } from "firebase/database";
import { db } from "../firebase";
import { useState } from "react";
import Loader from "../component/Loader";

export default function LeadForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        let mobile = e.target.mobile.value.replace(/\D/g, "");
        if (mobile.length === 10) mobile = "91" + mobile;

        const data = {
            name: e.target.name.value,
            mobile,
            email: e.target.email.value,
            companyName: e.target.companyName.value,
            isGifted: false,
            createdAt: Date.now()
        };

        await push(ref(db, "XtremUser"), data);

        setLoading(false);

        window.location.href =
            `https://wa.me/919876543210?text=Hi`;
    };

    if (loading) return <Loader text="Logging in..." />;

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" required />
            <input name="mobile" placeholder="Mobile" required />
            <input name="email" placeholder="Email" required />
            <input name="companyName" placeholder="Company" required />
            <button type="submit">Submit</button>
        </form>
    );
}
