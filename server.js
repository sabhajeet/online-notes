require("dotenv").config();
const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const isAuthenticated = require("./middleware/auth");

const app = express();
app.set("view engine", "ejs");

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false
  })
);
// for render.com mainly
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});


// Routes
app.use("/auth", require("./routes/auth"));
app.use("/notes", isAuthenticated, require("./routes/notes"));

app.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard.ejs");
  }
  res.redirect("/login.html");
});


// 👉 ADD HERE
const Note = require("./models/Note"); // add at top

app.get("/dashboard", isAuthenticated, async (req, res) => {
  const notes = await Note.find({ user: req.session.userId });

  res.render("dashboard", { notes });
});

app.listen(3000, () => console.log("Server running"));
