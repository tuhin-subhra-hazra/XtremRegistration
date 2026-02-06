import { ref, push, get, set } from "firebase/database";
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

        const userRef = ref(db, `XtremUser/${mobile}`);

        try {
            // 🔍 Check if mobile already exists
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                alert("This mobile number is already registered ❌");
                setLoading(false);
                return;
            }

            // ✅ Save user
            await set(userRef, {
                name: e.target.name.value,
                mobile,
                email: e.target.email.value,
                companyName: e.target.companyName.value,
                isGifted: false,
                createdAt: Date.now()
            });

            window.location.href =
                `https://wa.me/${import.meta.env.VITE_RECIPIENT_WA_NUMBER}?text=Hi`;

            setLoading(false);

        } catch (error) {
            console.error("Error saving user:", error);
            alert("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    if (loading) return <Loader text="Loading ..." />;

    return (
        <div className="form-container">
            <div className="header">
                <h2>Let's Connect</h2>
                <p>Fill out the details below to get started.</p>

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" placeholder="Enter your name" autoComplete="name" required />
                    </div>

                    <div className="form-group">
                        <label>Mobile No.</label>
                        <input type="tel" name="mobile" maxLength="10" pattern="[0-9]{10}"
                            placeholder="Enter your mobile number" autoComplete="tel" required />
                    </div>

                    <div className="form-group">
                        <label>Work Email</label>
                        <input type="email" name="email" placeholder="name@company.com" autoComplete="email" required />
                    </div>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" name="companyName" placeholder="Acme Inc." autoComplete="organization" required />
                    </div>

                    <button type="submit" id="submitBtn">
                        <span id="btnText">Submit Request</span>
                        <span id="loader" className="spinner hidden"></span>
                    </button>
                </form>

            </div>
        </div>
    );
}
