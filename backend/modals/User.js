// import mongoose from "mongoose";
// // const mongoose = require("mongoose");

// const AtsSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true
//   },

//   atsScore: {
//     type: Number,
//     required: true
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("AtsResult", AtsSchema);


import mongoose from "mongoose";

const AtsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  atsScore: {
    type: Number,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AtsResult = mongoose.model("AtsResult", AtsSchema);

export default AtsResult;   // ⭐ IMPORTANT
