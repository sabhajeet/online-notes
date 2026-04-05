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




// Forgot Password Route
// const express = require("express");
// const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// const User = require("../models/User");

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("User not found");

  // 🔹 Step 1: Generate token
  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  // 🔹 Step 2: Create reset link
  //const resetLink = `https://online-notes-wris.onrender.com/reset-password/${token}`;
  // const resetLink = `https://localhost:3000/reset-password/${token}`;
  const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
  const resetLink = `${BASE_URL}/reset-password/${token}`;



  // 🔹 Step 3: Setup transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 🔹 Step 4: SEND EMAIL (THIS IS WHERE IT GOES)
  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    html: `
      <h3>Reset your password</h3>
      <p>Click below link:</p>
      <a href="${resetLink}">${resetLink}</a>
    `
  });

  res.send("Password reset link sent to email...\n Check your E-mail, (sent from - sabhajeetkmr9@gmail.com)");
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() }
  });

  if (!user) return res.send("Invalid or expired token");

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;

  await user.save();

  res.send("Password reset successful");
});

module.exports = router;