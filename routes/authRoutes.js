const express = require("express");
const { loginUser, registerUser } = require("../controllers/userController.js");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route working" });
});

router.post("/register", registerUser);
router.post("/login", loginUser)
module.exports = router;