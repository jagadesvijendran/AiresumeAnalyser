// Last update
import express from "express";
import Groq from "groq-sdk";
import multer from "multer";
import pdf from "pdf-parse";
import dotenv from "dotenv";
import User from "../modals/User.js";

dotenv.config();
const router = express.Router();

/* ===========================
   FILE UPLOAD
=========================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ===========================
   GROQ CLIENT
=========================== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* ===========================
   SAFE JSON PARSER
=========================== */
function safeJSON(text) {
  try {
    const json = text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ===========================
   CLEAN NAME
=========================== */
function cleanName(name) {
  if (!name) return "Unknown";

  name = name
    .replace(/[\n\r]/g, "")
    .replace(/[^a-zA-Z.\s]/g, "")
    .trim();

  if (name.length < 3) return "Unknown";

  if (
    name.toLowerCase().includes("resume") ||
    name.toLowerCase().includes("curriculum") ||
    name.toLowerCase().includes("vitae")
  ) {
    return "Unknown";
  }

  return name;
}

/* ===========================
   ROUTE
=========================== */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    /* ---------- FILE CHECK ---------- */
    if (!req.file) {
      return res.status(400).json({ error: "Resume file missing" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF allowed" });
    }

    const jobDesc = req.body.jobDesc || "";

    /* ---------- PDF TEXT ---------- */
    let resumeText = "";
    try {
      const data = await pdf(req.file.buffer);
      resumeText = data.text;
    } catch {
      return res.status(400).json({
        error: "PDF read failed"
      });
    }

    /* ---------- NAME EXTRACTION ---------- */
    let username = "Unknown";

    try {
      const namePrompt = `
Return JSON only
{"name":""}

Resume:
${resumeText}
`;

      const nameRes = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        messages: [{ role: "user", content: namePrompt }]
      });

      const parsed = safeJSON(
        nameRes.choices?.[0]?.message?.content || ""
      );

      if (parsed?.name)
        username = cleanName(parsed.name);
    } catch {
      username = "Unknown";
    }

    /* ---------- SKILL ANALYSIS ---------- */
    let aiResult = {
      matchedSkills: [],
      missingSkills: [],
      suggestions: []
    };

    try {
      const skillPrompt = `
Return JSON only
{
"matchedSkills":[],
"missingSkills":[],
"suggestions":[]
}

Resume:
${resumeText}

Job:
${jobDesc}
`;

      const result = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [{ role: "user", content: skillPrompt }]
      });

      const parsed = safeJSON(
        result.choices?.[0]?.message?.content || ""
      );

      if (parsed) aiResult = parsed;
    } catch (err) {
      console.log("AI failed:", err.message);
    }

    /* ---------- ATS SCORE ---------- */
    const matched = aiResult.matchedSkills.length;
    const missing = aiResult.missingSkills.length;
    const total = matched + missing;

    const atsScore =
      total === 0 ? 0 : Math.round((matched / total) * 100);

    /* ---------- SAVE DB ---------- */
    try {
      await User.create({
        username,
        atsScore
      });
    } catch (dbErr) {
      console.log("DB save error:", dbErr.message);
    }

    /* ---------- RESPONSE ---------- */
    res.json({
      username,
      atsScore,
      matchedSkills: aiResult.matchedSkills,
      missingSkills: aiResult.missingSkills,
      suggestions: aiResult.suggestions
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
});

export default router;


// <-------------------------------------------------->
// import express from "express";
// import Groq from "groq-sdk";
// import multer from "multer";
// import pdf from "pdf-parse/lib/pdf-parse.js";
// import dotenv from "dotenv";
// import User from "../modals/User.js";

// dotenv.config();
// const router = express.Router();

// /* ===========================
//    FILE UPLOAD
// =========================== */
// const upload = multer({
//   storage: multer.memoryStorage()
// });

// /* ===========================
//    GROQ CLIENT
// =========================== */
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// function cleanName(name) {
//   if (!name) return "Unknown";

//   name = name
//     .replace(/[\n\r]/g, "")
//     .replace(/[^a-zA-Z.\s]/g, "")
//     .trim();

//   if (name.length < 3) return "Unknown";

//   if (
//     name.toLowerCase().includes("resume") ||
//     name.toLowerCase().includes("curriculum") ||
//     name.toLowerCase().includes("vitae")
//   ) {
//     return "Unknown";
//   }

//   return name;
// }



// /* ===========================
//    ANALYZE ROUTE
// =========================== */
// router.post("/", upload.single("resume"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         error: "Resume file missing"
//       });
//     }

//     const jobDesc = req.body.jobDesc || "";

//     /* ===========================
//        RESUME TEXT
//     =========================== */
//     const pdfData = await pdf(req.file.buffer);
//     const resumeText = pdfData.text;

//     /* ===========================
//        🔥 STEP 1 — NAME EXTRACTION
//     =========================== */

//     const namePrompt = `
// Return ONLY valid JSON.

// {
//   "name": ""
// }

// Rules:
// - name must be full name
// - no explanation
// - no markdown
// - if not found use "Unknown"

// Resume:
// ${resumeText}
// `;

//     const nameCompletion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       temperature: 0,
//       messages: [{ role: "user", content: namePrompt }]
//     });

//     const nameText =
//       nameCompletion.choices[0].message.content;

//     let username = "Unknown";

// try {
//   const nameJson = JSON.parse(
//     nameText.substring(
//       nameText.indexOf("{"),
//       nameText.lastIndexOf("}") + 1
//     )
//   );

//   username = cleanName(nameJson.name);

// } catch (e) {
//   console.log("⚠️ Name JSON parse failed");
// }

// if (!username || username === "undefined") {
//   username = "Unknown";
// }


//     /* ===========================
//        🔥 STEP 2 — SKILL ANALYSIS
//     =========================== */

//     const skillPrompt = `
// Return ONLY valid JSON.

// {
//   "matchedSkills": [],
//   "missingSkills": [],
//   "suggestions": []
// }

// Resume:
// ${resumeText}

// Job Description:
// ${jobDesc}
// `;

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       temperature: 0.2,
//       messages: [{ role: "user", content: skillPrompt }]
//     });

//     const text =
//       completion.choices[0].message.content;

//     const json = text.substring(
//       text.indexOf("{"),
//       text.lastIndexOf("}") + 1
//     );

//     const aiResult = JSON.parse(json);

//     /* ===========================
//        🔥 STEP 3 — ATS SCORE
//     =========================== */

//     const matched = aiResult.matchedSkills.length;
//     const missing = aiResult.missingSkills.length;

//     const total = matched + missing;

//     const atsScore =
//       total === 0
//         ? 0
//         : Math.round((matched / total) * 100);

//     /* ===========================
//        🔥 STEP 4 — SAVE DATABASE
//     =========================== */

//     await User.create({
//       username,
//       atsScore
//     });

//     /* ===========================
//        FINAL RESPONSE
//     =========================== */

//     res.json({
//       username,
//       atsScore,
//       matchedSkills: aiResult.matchedSkills,
//       missingSkills: aiResult.missingSkills,
//       suggestions: aiResult.suggestions
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       error: err.message
//     });
//   }
// });

// export default router;

// <-----------------------last working output------------------>
// import express from "express";
// import Groq from "groq-sdk";
// import multer from "multer";
// import pdf from "pdf-parse/lib/pdf-parse.js";
// import dotenv from "dotenv";
// import User from "../modals/User.js";   // ⭐ ADD THIS
// dotenv.config();
// const router = express.Router();
// /* ✅ memory storage */
// const upload = multer({
//   storage: multer.memoryStorage()
// });

// /* ✅ Groq client */
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// router.post("/", upload.single("resume"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Resume file missing" });
//     }
//     const username = req.body.username;
//     const jobDesc = req.body.jobDesc || "";

//     // if (!username) {
//     //        return res.status(400).json({
//     //     error: "Username missing"
//     //   });
//     // }
//     /* ✅ extract resume text */
//     const pdfData = await pdf(req.file.buffer);
//     const resumeText = pdfData.text;

//     /* ✅ AI PROMPT — score removed */
//     const prompt = `
// Return ONLY valid JSON:

// {
//   "matchedSkills": [],
//   "missingSkills": [],
//   "suggestions": []
// }

// Resume:
// ${resumeText}

// Job Description:
// ${jobDesc}
// `;

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       temperature: 0.2,
//       messages: [
//         { role: "user", content: prompt }
//       ]
//     });

//     const text = completion.choices[0].message.content;

//     const json = text.substring(
//       text.indexOf("{"),
//       text.lastIndexOf("}") + 1
//     );

//     const aiResult = JSON.parse(json);

//     /* ✅ ATS SCORE LOGIC */
//     const matched = aiResult.matchedSkills.length;
//     const missing = aiResult.missingSkills.length;

//     const total = matched + missing;

//     const atsScore =
//       total === 0 ? 0 : Math.round((matched / total) * 100);

//         await User.create({
//       username,
//       atsScore
//     });
//     /* ✅ FINAL RESPONSE */
//     res.json({
//       atsScore,
//       matchedSkills: aiResult.matchedSkills,
//       missingSkills: aiResult.missingSkills,
//       suggestions: aiResult.suggestions
//     });

   


//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

// import express from "express";
// import Groq from "groq-sdk";
// import multer from "multer";
// import pdf from "pdf-parse/lib/pdf-parse.js";
// import dotenv from "dotenv";
// import User from "../modals/User.js";   // ⭐ ADD THIS

// dotenv.config();

// const router = express.Router();

// /* ✅ memory storage */
// const upload = multer({
//   storage: multer.memoryStorage()
// });

// /* ✅ Groq client */
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// router.post("/", upload.single("resume"), async (req, res) => {
//   try {

//     if (!req.file) {
//       return res.status(400).json({ error: "Resume file missing" });
//     }

//     // ⭐ NEW
//     const username = req.body.username;
//     const jobDesc = req.body.jobDesc || "";

//     if (!username) {
//       return res.status(400).json({
//         error: "Username missing"
//       });
//     }

//     /* ✅ extract resume text */
//     const pdfData = await pdf(req.file.buffer);
//     const resumeText = pdfData.text;

//     /* ✅ AI PROMPT */
//     const prompt = `
// Return ONLY valid JSON:

// {
//   "matchedSkills": [],
//   "missingSkills": [],
//   "suggestions": []
// }

// Resume:
// ${resumeText}

// Job Description:
// ${jobDesc}
// `;

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       temperature: 0.2,
//       messages: [
//         { role: "user", content: prompt }
//       ]
//     });

//     const text = completion.choices[0].message.content;

//     const json = text.substring(
//       text.indexOf("{"),
//       text.lastIndexOf("}") + 1
//     );

//     const aiResult = JSON.parse(json);

//     /* ✅ ATS SCORE LOGIC */
//     const matched = aiResult.matchedSkills.length;
//     const missing = aiResult.missingSkills.length;

//     const total = matched + missing;

//     const atsScore =
//       total === 0 ? 0 : Math.round((matched / total) * 100);

//     // ⭐⭐ SAVE TO MONGODB
//     await User.create({
//       username,
//       atsScore
//     });

//     /* ✅ FINAL RESPONSE */
//     res.json({
//       username,
//       atsScore,
//       matchedSkills: aiResult.matchedSkills,
//       missingSkills: aiResult.missingSkills,
//       suggestions: aiResult.suggestions
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
