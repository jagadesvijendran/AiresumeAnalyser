//Last Update//

// import express from "express";
// import Groq from "groq-sdk";
// import multer from "multer";
// import pdf from "pdf-parse/lib/pdf-parse.js";
// import dotenv from "dotenv";
// import User from "../modals/User.js";

// dotenv.config();
// const router = express.Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// // ✅ Fixed safeJSON
// function safeJSON(text){
//   if(!text) return null;
//   try { return JSON.parse(text); }
//   catch {
//     try {
//       const match = text.match(/\{[\s\S]*\}/);
//       return match ? JSON.parse(match[0]) : null;
//     } catch { return null; }
//   }
// }

// router.post("/", upload.single("resume"), async (req,res)=>{
//   try{
//     if(!req.file)
//       return res.status(400).json({ error:"Resume missing" });

//     const jobDesc = req.body.jobDesc || "";

//     const pdfData = await pdf(req.file.buffer);
    
//     // ✅ Fixed — trim panrom
//     const resumeText = pdfData.text?.slice(0, 3000) || "";
    
//     if(!resumeText || resumeText.length < 20)
//       return res.status(400).json({ error:"Empty resume" });

//     const prompt = `
// You are an ATS Resume Analyzer AI.
// Return ONLY JSON, no extra text:
// {
//   "username":"",
//   "atsScore": 0,
//   "matchedSkills":[],
//   "missingSkills":[],
//   "suggestions":[]
// }
// RESUME: ${resumeText}
// JOB DESCRIPTION: ${jobDesc}
// `;

//     const ai = await groq.chat.completions.create({
//       model:"llama-3.1-8b-instant",
//       temperature:0.2,
//       messages:[{ role:"user", content: prompt }]
//     });

//     // ✅ Fixed — markdown strip
//     const raw = ai.choices?.[0]?.message?.content || "";
//     const cleaned = raw.replace(/```json|```/gi, "").trim();
//     console.log("AI RAW:", cleaned);

//     const result = safeJSON(cleaned);
//     if(!result)
//       return res.status(500).json({ error:"AI parse failed" });

//     try{
//       // ✅ Fixed — fallback values
//       await User.create({
//         username: result.username || "Unknown",
//         atsScore: result.atsScore || 0
//       });
//     }catch(err){
//       console.log("DB save error:", err.message);
//     }

//     res.json(result);

//   }catch(err){
//     console.error("SERVER ERROR:", err);
//     res.status(500).json({ error:"Server crashed", details: err.message });
//   }
// });

// export default router;








import express from "express";
import Groq from "groq-sdk";
import multer from "multer";
import pdf from "pdf-parse/lib/pdf-parse.js";
import dotenv from "dotenv";
import User from "../modals/User.js";

dotenv.config();
const router = express.Router();

/* ========= MULTER ========= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* ========= GROQ ========= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* ========= SAFE JSON ========= */
function safeJSON(text){
  try { return JSON.parse(text); }
  catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

/* ========= ROUTE ========= */
router.post("/", upload.single("resume"), async (req,res)=>{
  try{

    if(!req.file)
      return res.status(400).json({ error:"Resume missing" });

    const jobDesc = req.body.jobDesc || "";

    /* ---------- PDF → TEXT ---------- */
    const pdfData = await pdf(req.file.buffer);
    const resumeText = pdfData.text;

    if(!resumeText)
      return res.status(400).json({ error:"Empty resume" });

    /* ===================================================
        FULL AI ANALYSIS PROMPT
    =================================================== */

//     const prompt = `
// You are an ATS Resume Analyzer AI.

// Compare the RESUME and JOB DESCRIPTION.

// Return ONLY JSON format:

// {
//  "username":"",
//  "atsScore": number (0-100),
//  "matchedSkills":[],
//  "missingSkills":[],
//  "suggestions":[]
// }

// Rules:
// - Extract candidate name from resume
// - Identify real skills only
// - Ignore filler words
// - Score based on relevance match
// - Suggestions must be practical

// RESUME:
// ${resumeText}

// JOB DESCRIPTION:
// ${jobDesc}
// `;



//Last update


const prompt = `
You are a strict ATS Resume Analyzer AI.

TASK:
Compare ONLY the given RESUME and JOB DESCRIPTION.

IMPORTANT RULES:
- Do NOT assume or add any skills that are not present in JOB DESCRIPTION.
- Only check resume skills against JOB DESCRIPTION skills.
- If a skill is in resume but NOT in job description → ignore it.
- If a skill is in job description but NOT in resume → add to missingSkills.
- Score must be calculated ONLY based on how many job description skills match resume.
- Do NOT use general knowledge.
- Do NOT guess.
- Be strict and accurate.
Suggestions Rule:
- For each missing skill, give one practical improvement suggestion.
- Suggestions must be based ONLY on missingSkills.

RETURN ONLY JSON:

{
 "username":"",
 "atsScore": number (0-100),
 "matchedSkills":[],
 "missingSkills":[],
 "suggestions":[]
}

SCORING RULE:
atsScore = (matchedSkills / total job description skills) × 100

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDesc}
`;
      

    /* ---------- AI CALL ---------- */

    const ai = await groq.chat.completions.create({
      model:"llama-3.1-8b-instant",
      temperature:0.2,
      messages:[{ role:"user", content: prompt }]
    });

    const raw = ai.choices?.[0]?.message?.content;
    console.log("AI RAW:", raw);

    const result = safeJSON(raw);

    if(!result)
      return res.status(500).json({ error:"AI parse failed" });

    /* ---------- SAVE DB ---------- */

    try{
      await User.create({
        username: result.username,
        atsScore: result.atsScore
      });
    }catch(err){
      console.log("DB save error:", err.message);
    }

    /* ---------- RESPONSE ---------- */

    res.json(result);

  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Server crashed", details: err.message });
  }
});

export default router;







// import express from "express";
// import Groq from "groq-sdk";
// import multer from "multer";
// import pdf from "pdf-parse/lib/pdf-parse.js";
// import dotenv from "dotenv";
// import User from "../modals/User.js";

// dotenv.config();
// const router = express.Router();

// /* ===========================
//    MULTER CONFIG
// =========================== */
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// /* ===========================
//    GROQ CLIENT
// =========================== */
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// /* ===========================
//    SAFE JSON PARSER
// =========================== */
// function safeJSON(text){
//   if(!text) return null;
//   try{
//     return JSON.parse(text);
//   }catch{
//     try{
//       const match = text.match(/\{[\s\S]*\}/);
//       return match ? JSON.parse(match[0]) : null;
//     }catch{
//       return null;
//     }
//   }
// }

// /* ===========================
//    CLEAN NAME
// =========================== */
// function cleanName(name){
//   if(!name) return "Unknown";

//   name = name
//     .replace(/[\n\r]/g,"")
//     .replace(/[^a-zA-Z.\s]/g,"")
//     .trim();

//   if(name.length < 3) return "Unknown";

//   const lower = name.toLowerCase();
//   if(
//     lower.includes("resume") ||
//     lower.includes("curriculum") ||
//     lower.includes("vitae")
//   ) return "Unknown";

//   return name;
// }

// /* ===========================
//    EXTRACT SKILLS FROM JOB DESC
// =========================== */
// function extractJobSkills(text){
//   return text
//     .toLowerCase()
//     .replace(/[^\w\s+#.]/g,"")
//     .split(/\s+/)
//     .filter(word => word.length > 2);
// }

// function unique(arr){
//   return [...new Set(arr)];
// }

// /* ===========================
//    ROUTE
// =========================== */
// router.post("/", upload.single("resume"), async (req,res)=>{
//   try{

//     /* ---------- FILE CHECK ---------- */
//     if(!req.file)
//       return res.status(400).json({ error:"Resume file missing" });

//     if(req.file.mimetype !== "application/pdf")
//       return res.status(400).json({ error:"Only PDF allowed" });

//     const jobDesc = req.body.jobDesc || "";

//     /* ---------- PDF READ ---------- */
//     let resumeText = "";

//     try{
//       const data = await pdf(req.file.buffer);
//       resumeText = data.text;
//     }catch(err){
//       console.log("PDF ERROR:", err.message);
//       return res.status(400).json({ error:"PDF read failed" });
//     }

//     if(!resumeText || resumeText.length < 20)
//       return res.status(400).json({ error:"Empty resume text" });

//     /* ---------- NAME EXTRACTION ---------- */
//     let username = "Unknown";

//     try{
//       const prompt = `
// Return ONLY JSON
// {"name":""}

// Resume:
// ${resumeText}
// `;

//       const ai = await groq.chat.completions.create({
//         model:"llama-3.1-8b-instant",
//         temperature:0,
//         messages:[{ role:"user", content: prompt }]
//       });

//       const raw = ai.choices?.[0]?.message?.content;
//       console.log("NAME RAW:", raw);

//       const parsed = safeJSON(raw);

//       if(parsed?.name)
//         username = cleanName(parsed.name);

//     }catch(err){
//       console.log("Name AI error:", err.message);
//     }

//     /* ===========================
//        SKILL MATCH ENGINE
//     =========================== */

//     const jobSkills = unique(extractJobSkills(jobDesc));

//     const resumeLower = resumeText.toLowerCase();

//     const matchedSkills = jobSkills.filter(skill =>
//       resumeLower.includes(skill)
//     );

//     const missingSkills = jobSkills.filter(skill =>
//       !resumeLower.includes(skill)
//     );

//     const suggestions = missingSkills.map(skill =>
//       `Add ${skill} experience to your resume`
//     );

//     /* ---------- ATS SCORE ---------- */
//     const matched = matchedSkills.length;
//     const missing = missingSkills.length;
//     const total = matched + missing;

//     const atsScore =
//       total === 0 ? 0 : Math.round((matched / total) * 100);

//     /* ---------- SAVE DB ---------- */
//     try{
//       await User.create({ username, atsScore });
//     }catch(err){
//       console.log("DB error:", err.message);
//     }

//     /* ---------- RESPONSE ---------- */
//     res.json({
//       username,
//       atsScore,
//       matchedSkills,
//       missingSkills,
//       suggestions
//     });

//   }catch(err){
//     console.error("SERVER ERROR:", err);

//     res.status(500).json({
//       error:"Server crashed",
//       details: err.message
//     });
//   }
//    //last update---for console output
//    console.log("FINAL RESPONSE:", {
//   username,
//   atsScore,
//   matchedSkills,
//   missingSkills,
//   suggestions
// });

// res.json({
//   username,
//   atsScore,
//   matchedSkills,
//   missingSkills,
//   suggestions
// });
// });

// export default router;

// import express from "express";
// import Groq from "groq-sdk";
// import multer from "multer";
// import pdf from "pdf-parse/lib/pdf-parse.js"; // ✅ FIXED
// import dotenv from "dotenv";
// import User from "../modals/User.js";
// dotenv.config();
// const router = express.Router();

// /* ===========================
//    FILE UPLOAD
// =========================== */
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });

// /* ===========================
//    GROQ CLIENT
// =========================== */
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// /* ===========================
//    SAFE JSON PARSER
// =========================== */
// function safeJSON(text) {
//   try {
//     const json = text.substring(
//       text.indexOf("{"),
//       text.lastIndexOf("}") + 1
//     );
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// /* ===========================
//    CLEAN NAME
// =========================== */
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
//    ROUTE
// =========================== */
// router.post("/", upload.single("resume"), async (req, res) => {
//   try {
//     /* ---------- FILE CHECK ---------- */
//     if (!req.file) {
//       return res.status(400).json({ error: "Resume file missing" });
//     }

//     if (req.file.mimetype !== "application/pdf") {
//       return res.status(400).json({ error: "Only PDF allowed" });
//     }

//     const jobDesc = req.body.jobDesc || "";

//     /* ---------- PDF TEXT ---------- */
//     let resumeText = "";
//     try {
//       const data = await pdf(req.file.buffer);
//       resumeText = data.text;
//     } catch {
//       return res.status(400).json({
//         error: "PDF read failed"
//       });
//     }

//     /* ---------- NAME EXTRACTION ---------- */
//     let username = "Unknown";

//     try {
//       const namePrompt = `
// Return JSON only
// {"name":""}

// Resume:
// ${resumeText}
// `;

//       const nameRes = await groq.chat.completions.create({
//         model: "llama-3.1-8b-instant",
//         temperature: 0,
//         messages: [{ role: "user", content: namePrompt }]
//       });

//       const parsed = safeJSON(
//         nameRes.choices?.[0]?.message?.content || ""
//       );

//       if (parsed?.name)
//         username = cleanName(parsed.name);
//     } catch {
//       username = "Unknown";
//     }

//     /* ---------- SKILL ANALYSIS ---------- */
//     let aiResult = {
//       matchedSkills: [],
//       missingSkills: [],
//       suggestions: []
//     };

//     try {
//       const skillPrompt = `
// Return JSON only
// {
// "matchedSkills":[],
// "missingSkills":[],
// "suggestions":[]
// }

// Resume:
// ${resumeText}

// Job:
// ${jobDesc}
// `;

//       const result = await groq.chat.completions.create({
//         model: "llama-3.1-8b-instant",
//         temperature: 0.2,
//         messages: [{ role: "user", content: skillPrompt }]
//       });

//       const parsed = safeJSON(
//         result.choices?.[0]?.message?.content || ""
//       );

//       if (parsed) aiResult = parsed;
//     } catch (err) {
//       console.log("AI failed:", err.message);
//     }

//     /* ---------- ATS SCORE ---------- */
//     const matched = aiResult.matchedSkills.length;
//     const missing = aiResult.missingSkills.length;
//     const total = matched + missing;

//     const atsScore =
//       total === 0 ? 0 : Math.round((matched / total) * 100);

//     /* ---------- SAVE DB ---------- */
//     try {
//       await User.create({
//         username,
//         atsScore
//       });
//     } catch (dbErr) {
//       console.log("DB save error:", dbErr.message);
//     }

//     /* ---------- RESPONSE ---------- */
//     res.json({
//       username,
//       atsScore,
//       matchedSkills: aiResult.matchedSkills,
//       missingSkills: aiResult.missingSkills,
//       suggestions: aiResult.suggestions
//     });

//   } catch (err) {
//     console.error("SERVER ERROR:", err);

//     res.status(500).json({
//       error: "Server crashed",
//       details: err.message
//     });
//   }
// });

// export default router;


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
