// const express = require("express");
// const router = express.Router();

// router.get("/", (req, res) => {
//   res.json({ message: "Auth route working" });
// });

// module.exports = router;


// import express from "express";
// const router = express.Router();

// // test route
// router.get("/", (req, res) => {
//   res.json({ message: "Auth route working" });
// });

// // login route
// router.post("/login", (req, res) => {
//   res.json({ message: "LOGIN WORKS" });
// });

// export default router;

import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();


const fakeUser = {
  id: 1,
  email: "admin@test.com",
  password: "123456",
  role: "admin"
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  
  if (email !== fakeUser.email || password !== fakeUser.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }


  const token = jwt.sign(
    {
      id: fakeUser.id,
      role: fakeUser.role
    },
    "secretKey123",
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login success",
    token
  });
});

export default router;