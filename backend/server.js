// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import analyze from "./routes/analyze.js";

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/api/analyze", analyze);
// app.listen(5000, () => {
//   console.log("SERVER RUNNING ON http://localhost:5000");
// });
// console.log("API KEY:", process.env.GEMINI_API_KEY);


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import analyzeRoute from "./routes/analyze.js";

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // ===============================
// // API ROUTE
// // ===============================
// app.use("/api", analyzeRoute);
// // app.use("/api/upload-resume", analyzeRoute);


// // ===============================


// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`SERVER RUNNING ON http://localhost:${PORT}`);
// });

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import analyzeRoute from "./routes/analyze.js";

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/analyze", analyzeRoute);

// app.listen(5000, () => {
//   console.log("SERVER RUNNING ON http://localhost:5000");
// });


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import analyzeRoute from "./routes/analyze.js";

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/analyze", analyzeRoute);

// app.listen(5000, () => {
//   console.log("SERVER RUNNING ON http://localhost:5000");
// });


// import express from "express";
// import dotenv from "dotenv";
// import analyzeRoute from "./routes/analyze.js";

// dotenv.config(); // ⭐ MUST BE FIRST

// const app = express();

// app.use(express.json());
// app.use("/api/analyze", analyzeRoute);

// app.listen(5000, () => {
//   console.log("SERVER RUNNING ON http://localhost:5000");
//   console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "LOADED ✅" : "MISSING ❌");
// });



// <--------------------------------------------->
// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import analyzeRoute from "./routes/analyze.js";


// const app = express();

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.log(err));


// /* ✅ ADD THIS */
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST"],
//   credentials: true
// }));

// app.use(express.json());

// app.use("/api/analyze", analyzeRoute);

// app.listen(5000, () => {

//   console.log("SERVER RUNNING ON http://localhost:5000");
// });

// <---------------------------------------------------------->last final working version

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import loginroute from "./routes/loginroutes.js";
// import analyzeRoute from "./routes/analyze.js";



// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ VERY IMPORTANT
// app.use("/api/login", loginroute);
// app.use("/api/analyze", analyzeRoute);

// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log("✅ MongoDB Connected"))
// .catch(err => console.log("❌ Mongo Error:", err));



// app.listen(5000, () => {
// console.log("SERVER RUNNING ON http://localhost:5000");
// });


// <-------------------------------------------------------->

// last update

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import loginroute from "./routes/loginroutes.js";
import analyzeRoute from "./routes/analyze.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ✅ HEALTH CHECK ROUTE — ADD HERE */
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

/* ROUTES */
app.use("/api/login", loginroute);
app.use("/api/analyze", analyzeRoute);
app.use(express.urlencoded({ extended: true }));
/* DB */
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("Mongo Connected"))
.catch(err=> console.log(err));

/* SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log("Server running", PORT));








// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.log(err));

// app.use("/api", require("./routes/auth"));
// app.use("/api", require("./routes/analyze"));

// app.listen(5000, () =>
//   console.log("🚀 Server running on port 5000")
// );







// import express from "express";
// import dotenv from "dotenv";
// import resumeRoutes from "./routes/resumeRoutes.js";

// dotenv.config();

// const app = express();

// app.use(express.json());

// app.use("/api/analyze", resumeRoutes);

// app.listen(5000, () => {
//   console.log("SERVER RUNNING ON http://localhost:5000");
// });
