const admin = require("firebase-admin");
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // 🚀 Railway / Production
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("🔥 Firebase loaded from ENV");
} else {
    // 💻 Local development
    serviceAccount = require("./firebase-key.json");
    console.log("💻 Firebase loaded from local file");
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

const db = admin.firestore();

console.log("✅ Firebase Connected");

module.exports = db;
