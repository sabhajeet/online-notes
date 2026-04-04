require("dotenv").config();
const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const isAuthenticated = require("./middleware/auth");

const app = express();
app.set("view engine", "ejs");

connectDB();

// Required for form POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Static files
app.use(express.static("public"));

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false
  })
);

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

//Route to open reset page
app.get("/reset-password/:token", (req, res) => {
  res.sendFile(__dirname + "/public/reset.html");
});

app.listen(3000, () => console.log("Server running"));