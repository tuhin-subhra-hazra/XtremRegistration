const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(session({
    secret: "xtrem-admin-secret",
    resave: false,
    saveUninitialized: false
}));

app.use('/', require('./routes/routes'));
app.use('/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

