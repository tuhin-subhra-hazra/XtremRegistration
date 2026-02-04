const express = require('express');
const Router = express.Router();
const db = require("../database/firebaseAdmin");
const admin = require("firebase-admin");

Router.post("/submit", async (req, res) => {
    let { name, mobile, email, companyName } = req.body;

    mobile = normalizeMobile(mobile);

    try {
        const userRef = db.collection("XtremUser");
        const snapshot = await userRef.where("mobile", "==", mobile).get();

        if (snapshot.empty) {
            await userRef.add({
                name,
                mobile,
                email,
                companyName,
                isGifted: false, 
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        const message = encodeURIComponent("Hi");
        res.redirect(`https://wa.me/${process.env.WA_NUMBER}?text=${message}`);

    } catch (err) {
        console.error("❌ Firebase Error:", err);
        res.status(500).send("Error saving data");
    }
});

function normalizeMobile(mobile) {
    let m = mobile.replace(/\D/g, "");

    if (m.startsWith("91") && m.length === 12) return m;
    if (m.length === 10) return "91" + m;

    return m;
}

module.exports = Router;