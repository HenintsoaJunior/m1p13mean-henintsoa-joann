const mongoose = require("mongoose");

const couleurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de la couleur est requis"],
      trim: true,
    },
    codeHex: {
      type: String,
      required: [true, "Le code hexadécimal est requis"],
      uppercase: true,
      trim: true,
      match: [/^#[0-9A-F]{6}$/, "Le code hexadécimal doit être au format #RRVVBB"],
    },
    codeRgb: {
      rouge: {
        type: Number,
        min: 0,
        max: 255,
      },
      vert: {
        type: Number,
        min: 0,
        max: 255,
      },
      bleu: {
        type: Number,
        min: 0,
        max: 255,
      },
    },
    categorie: {
      type: String,
      enum: {
        values: [
          "neutre",
          "chaud",
          "froid",
          "vif",
          "pastel",
          "metallique",
          "fluo",
          "autre",
        ],
        message: "Catégorie de couleur invalide",
      },
      default: "autre",
    },
    estActif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index unique sur le code hex
couleurSchema.index({ codeHex: 1 }, { unique: true });
couleurSchema.index({ nom: 1 });
couleurSchema.index({ categorie: 1 });

// Hook pre-save pour auto-remplir RGB (utilisant async/await pour Mongoose 9.x)
couleurSchema.pre("save", async function () {
  if (this.codeHex && (!this.codeRgb || !this.codeRgb.rouge)) {
    const hex = this.codeHex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    this.codeRgb = { rouge: r, vert: g, bleu: b };
  }
});

module.exports = mongoose.model("Couleur", couleurSchema);
