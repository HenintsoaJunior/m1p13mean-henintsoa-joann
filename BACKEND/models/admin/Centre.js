const mongoose = require("mongoose");

const centreSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  adresse: {
    rue: String,
    ville: String,
    code_postal: String,
    pays: String,
    coordonnees: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  description: String,
  image_url: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop'
  },
  horaires_ouverture: {
    type: Map,
    of: String
  },
  email_contact: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, "Email invalide"]
  },
  telephone_contact: String,
  cree_le: {
    type: Date,
    default: Date.now
  },
  modifie_le: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: "cree_le", updatedAt: "modifie_le" }
});

centreSchema.index({ "adresse.coordonnees": "2dsphere" });
centreSchema.index({ slug: 1 });

module.exports = mongoose.model("Centre", centreSchema);
