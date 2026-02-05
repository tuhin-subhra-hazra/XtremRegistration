const express = require('express');
const Router = express.Router();
const db = require("../database/firebaseAdmin");
const bcrypt = require("bcrypt");

// Router.get("/login", (req, res) => {
//     res.send(`
//         <h2>Admin Login</h2>
//         <form method="POST" action="/admin/login">
//             <input name="username" placeholder="Username" required /><br><br>
//             <input type="password" name="password" placeholder="Password" required /><br><br>
//             <button type="submit">Login</button>
//         </form>
//     `);
// });

Router.get("/login", (req, res) => {
    res.render("admin-login", { error: null });
});

Router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const snapshot = await db
            .collection("Admin")
            .where("username", "==", username)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.render("admin-login", {
                error: "Invalid username or password"
            });
        }

        const adminDoc = snapshot.docs[0];
        const admin = adminDoc.data();

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.render("admin-login", {
                error: "Invalid username or password"
            });
        }

        // ✅ Login success
        req.session.adminId = adminDoc.id;
        req.session.adminUsername = admin.username;

        res.redirect("/admin/dashboard");

    } catch (err) {
        console.error("Admin login error:", err);
        res.render("adminLogin", {
            error: "Something went wrong. Please try again."
        });
    }
});


function adminAuth(req, res, next) {
    if (req.session.adminId) {
        return next();
    }
    res.redirect("/admin/login");
}

Router.get("/dashboard", adminAuth, async (req, res) => {
    const snap = await db.collection("XtremUser").get();

    const users = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.render("admin-dashboard", { users });
});


Router.post("/gift", adminAuth, async (req, res) => {
    const { docId, scrollTo } = req.body;

    try {
        await db.collection("XtremUser")
            .doc(docId)
            .update({
                isGifted: true
            });

        res.redirect(`/admin/dashboard#${scrollTo}`);

    } catch (err) {
        console.error("Gift update error:", err);
        res.status(500).send("Failed to update");
    }
});


Router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
});

module.exports = Router;
