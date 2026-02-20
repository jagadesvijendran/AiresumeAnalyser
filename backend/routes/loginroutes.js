import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (username === "ram" && password === "123") {
    return res.json({
      token: "dummy-jwt-token"
    });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

export default router;
