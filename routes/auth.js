const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (req.body.password !== req.body.confirmPassword) {
  return res.send("Passwords do not match");
}

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({ email, password: hashedPassword });
    res.redirect("/login.html");
  } catch (err) {
    res.send("User already exists");
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Wrong password");

  req.session.userId = user._id;

  res.redirect("/dashboard");
});


// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login.html");
});

module.exports = router;