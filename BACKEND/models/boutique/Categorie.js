const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: [true, "L'ID de la boutique est requis"],
    },
    nom: {
      type: String,
      required: [true, "Le nom de la catégorie est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    slug: {
      type: String,
      required: [true, "Le slug est requis"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    idCategorieParent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie",
      default: null,
    },
    urlImage: {
      type: String,
      trim: true,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateMiseAJour: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "dateCreation", updatedAt: "dateMiseAJour" },
  }
);

// Index composés pour optimiser les recherches
categorieSchema.index({ idBoutique: 1, slug: 1 });
categorieSchema.index({ idCategorieParent: 1 });

// Note: dateMiseAJour est géré automatiquement par l'option timestamps du schema

// Méthode pour obtenir les informations publiques
categorieSchema.methods.toJSON = function () {
  const categorie = this.toObject();
  return categorie;
};

// Méthode statique pour construire l'arbre des catégories récursivement
categorieSchema.statics.buildCategoryTree = async function (idBoutique) {
  const categories = await this.find({ idBoutique }).lean();
  
  // Map pour stocker toutes les catégories par ID
  const categoryMap = new Map();
  const rootCategories = [];
  
  // Initialiser chaque catégorie avec un tableau children
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      _id: cat._id.toString(),
      idCategorieParent: cat.idCategorieParent ? cat.idCategorieParent.toString() : null,
      children: []
    });
  });
  
  // Construire l'arbre
  categories.forEach(cat => {
    const categoryId = cat._id.toString();
    const category = categoryMap.get(categoryId);
    const parentId = cat.idCategorieParent ? cat.idCategorieParent.toString() : null;
    
    if (parentId && categoryMap.has(parentId)) {
      categoryMap.get(parentId).children.push(category);
    } else {
      rootCategories.push(category);
    }
  });
  
  return rootCategories;
};

// Méthode statique pour obtenir toutes les catégories avec leur chemin hiérarchique
categorieSchema.statics.getCategoriesWithHierarchy = async function (idBoutique) {
  const categories = await this.find({ idBoutique }).lean();
  const categoryMap = new Map();
  
  // Créer une map pour un accès rapide
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      _id: cat._id.toString(),
      idCategorieParent: cat.idCategorieParent ? cat.idCategorieParent.toString() : null,
      level: 0,
      path: []
    });
  });
  
  // Calculer le niveau et le chemin pour chaque catégorie
  const calculateHierarchy = (categoryId, visited = new Set()) => {
    if (visited.has(categoryId)) return 0; // Éviter les cycles
    visited.add(categoryId);
    
    const category = categoryMap.get(categoryId);
    if (!category) return 0;
    
    if (category.idCategorieParent && categoryMap.has(category.idCategorieParent)) {
      const parentLevel = calculateHierarchy(category.idCategorieParent, visited);
      category.level = parentLevel + 1;
      const parent = categoryMap.get(category.idCategorieParent);
      category.path = [...parent.path, parent.nom];
    } else {
      category.level = 0;
      category.path = [];
    }
    
    return category.level;
  };
  
  categoryMap.forEach((_, id) => calculateHierarchy(id));
  
  return Array.from(categoryMap.values());
};

module.exports = mongoose.model("Categorie", categorieSchema);
