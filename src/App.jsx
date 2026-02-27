// import { useState,useEffect } from "react";
// import axios from "axios";
// import './App.css'

// function App() {
//   const [resume, setResume] = useState(null);
//   const [jobDesc, setJobDesc] = useState("");
//   const [result, setResult] = useState({
//     matchedSkills: [],
//     missingSkills: [],
//     summary: "",
//     atsScore: 0,
//   });
//   const [loading, setLoading] = useState(false);

  


// // <----------------------->
// const [user, setUser] = useState(null);

// useEffect(() => {
//   const username = localStorage.getItem("username");
//   if (username) setUser(username);
// }, []);




// // <-------------------------->






//   const analyzeResume = async () => {
//     if (!resume || !jobDesc.trim()) {
//       alert("Please upload resume and enter job description");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("resume", resume);
//     formData.append("jobDesc", jobDesc);

//     try {
//       setLoading(true);
//      const res =await axios.post(
//   "http://localhost:5000/api/analyze",
//   formData,
//   {
//     headers: {
//       "Content-Type": "multipart/form-data"
//     }
//   }
// );
//       setResult(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong. Check console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 40 }} className="main">
//       <div className="main1">
//         <h1>AI Resume Analyzer</h1>

// <label className="file-upload">
//    Upload Resume
//   <input
//     type="file"
//     accept=".pdf"
//     onChange={(e) => setResume(e.target.files[0])}
//   />
// </label>
      

//       <br /><br />

//       <textarea
//         rows={8}
//         placeholder="Paste Job Description"
//         value={jobDesc}
//         onChange={(e) => setJobDesc(e.target.value)}
//       />

//       <br /><br />

//       <button className="file-upload" onClick={analyzeResume}>
//         {loading ? "Analyzing..." : " Analyze"}
//       </button>

//       {result && (
//         <div style={{ marginTop: 30 }}>
//           <h2>ATS Score: {result.atsScore}%</h2>

//         <progress value={result.atsScore} max="100"></progress>


//           <h4>Matched Skills</h4>
//           <ul>
//             {result.matchedSkills?.length
//               ? result.matchedSkills.map((s, i) => <li key={i}>{s}</li>)
//               : <li>No matched skills</li>}
//           </ul>

//           <h4>Missing Skills</h4>
//           <ul>
//             {result.missingSkills?.length
//               ? result.missingSkills.map((s, i) => <li key={i}>{s}</li>)
//               : <li>No missing skills</li>}
//           </ul>

//           <p>
//             <b>Summary:</b> {result.summary || "No summary available"}
//           </p>
//         </div>
//       )}

//       </div>
//       <div className="main2">
       

//       </div>
      
//     </div>
//   );
// }

// export default App;



import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  // const [result, setResult] = useState({
  //   matchedSkills: [],
  //   missingSkills: [],
  //   summary: "",
  //   atsScore: 0,
  // });
const [result, setResult] = useState({
  matchedSkills: [],
  missingSkills: [],
  suggestions: [],
  atsScore: 0,
});

  
  const [loading, setLoading] = useState(false);



  // ✅ ANALYZE FUNCTION
  const analyzeResume = async () => {
    if (!resume || !jobDesc.trim()) {
      alert("Upload resume and enter job description");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDesc", jobDesc);

    try {
      setLoading(true);
  // "http://localhost:5000/api/analyze",
  // formData
      
//       const res = await axios.post(
// "https://airesumeanalyser-xucr.onrender.com/api/analyze", formData

// );

//       const res = await axios.post(
//   "https://airesumeanalyser-xucr.onrender.com/api/analyze",
//   formData,
//   { timeout: 60000 } // 60 seconds
// );


      // setResult(res.data);

// last update    
const res = await axios.post(
  "https://airesumeanalyser-xucr.onrender.com/api/analyze",
  formData,
  // { timeout: 60000 }
  { timeout: 120000 }
);

console.log("API RESPONSE:", res.data); // ⭐ ADD THIS

setResult(res.data);


      
    } 
    catch (err) {
  console.error(err);
  alert("Error analyzing resume. Backend not responding.");
}
    finally {
      setLoading(false);
    }
  };

  // ✅ MAIN APP PAGE
  return (
   


        <div style={{ padding: 40 }} className="main">

   
      <div className="main1">
        <h1>AI Resume Analyzer</h1>

<label className="file-upload">
   Upload Resume
  <input
    type="file"
    accept=".pdf"
    onChange={(e) => setResume(e.target.files[0])}
  />
</label>
      

      <br /><br />

      <textarea
        rows={8}
        placeholder="Paste Job Description"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />

      <br /><br />

      <button className="file-upload" onClick={analyzeResume}>
        {loading ? "Analyzing..." : " Analyze"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>ATS Score: {result.atsScore}%</h2>

        <progress value={result.atsScore} max="100"></progress>


          <h4>Matched Skills</h4>
          <ul>
            {result.matchedSkills?.length
              ? result.matchedSkills.map((s, i) => <li key={i}>{s}</li>)
              : <li>No matched skills</li>}
          </ul>

          <h4>Missing Skills</h4>
          <ul>
            {result.missingSkills?.length
              ? result.missingSkills.map((s, i) => <li key={i}>{s}</li>)
              : <li>No missing skills</li>}
          </ul>

          {result.suggestions?.length > 0 && (
  <>
    <h4>Suggestions</h4>
    <ul>
      {result.suggestions.map((s,i)=><li key={i}>{s}</li>)}
    </ul>
  </>
)}

    
        </div>
      )}

      </div>
      <div className="main2">
       

      </div>

</div>

    
  );
}

export default App;
 // <div style={{ padding: 40 }} className="main">

    //   <div style={{ textAlign: "right" }}>
    //      {user}
    //     <button onClick={logout} style={{ marginLeft: 15 }}>
    //       Logout
    //     </button>
    //   </div>

    //   <h1>AI Resume Analyzer</h1>

    //   <label className="file-upload">
    //     Upload Resume
    //     <input
    //       type="file"
    //       accept=".pdf"
    //       onChange={(e) => setResume(e.target.files[0])}
    //     />
    //   </label>

    //   <br /><br />

    //   <textarea
    //     rows={8}
    //     placeholder="Paste Job Description"
    //     value={jobDesc}
    //     onChange={(e) => setJobDesc(e.target.value)}
    //   />

    //   <br /><br />

    //   <button className="file-upload" onClick={analyzeResume}>
    //     {loading ? "Analyzing..." : "Analyze"}
    //   </button>

    //   {result && (
    //     <div style={{ marginTop: 30 }}>
    //       <h2>ATS Score: {result.atsScore}%</h2>
    //       <progress value={result.atsScore} max="100"></progress>

    //       <h4>Matched Skills</h4>
    //       <ul>
    //         {result.matchedSkills.length
    //           ? result.matchedSkills.map((s, i) => (
    //               <li key={i}>{s}</li>
    //             ))
    //           : <li>No matched skills</li>}
    //       </ul>

    //       <h4>Missing Skills</h4>
    //       <ul>
    //         {result.missingSkills.length
    //           ? result.missingSkills.map((s, i) => (
    //               <li key={i}>{s}</li>
    //             ))
    //           : <li>No missing skills</li>}
    //       </ul>

    //       <p>
    //         <b>Summary:</b> {result.summary}
    //       </p>
    //     </div>
    //   )}
    // </div>



