const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Create Note
router.post("/add", async (req, res) => {
  const { title, content, color } = req.body;

  await Note.create({
    title,
    content,
    color,
    user: req.session.userId
  });

  res.redirect("/dashboard");
});

// Delete Note
router.post("/delete/:id", async (req, res) => {
  await Note.deleteOne({ _id: req.params.id });
  res.redirect("/dashboard");
});

// Show Edit Form
router.get("/edit/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render("edit-note", { note });
});

// Update Note
router.post("/update/:id", async (req, res) => {
  const { title, content } = req.body;

  await Note.updateOne(
    { _id: req.params.id },
    { title, content }
  );

  res.redirect("/dashboard");
});

module.exports = router;