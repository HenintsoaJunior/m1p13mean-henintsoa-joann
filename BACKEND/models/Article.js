const mongoose = require("mongoose");
const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["Actualités", "Sport", "Divertissement", "Technologie", "Autre"],
      default: "Actualités",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Article", ArticleSchema);
