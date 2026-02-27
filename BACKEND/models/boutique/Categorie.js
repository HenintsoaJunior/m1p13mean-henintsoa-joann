const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema(
  {
    idBoutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      default: null, // Optionnel - catégories globales
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
      unique: true, // Unique globalement
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

// Index pour optimiser les recherches
categorieSchema.index({ slug: 1 });
categorieSchema.index({ idCategorieParent: 1 });

// Méthode pour obtenir les informations publiques
categorieSchema.methods.toJSON = function () {
  const categorie = this.toObject();
  return categorie;
};

// Méthode statique pour construire l'arbre des catégories récursivement (par boutique - pour compatibilité)
categorieSchema.statics.buildCategoryTree = async function (idBoutique) {
  const query = idBoutique ? { idBoutique } : {};
  const categories = await this.find(query).lean();
  
  const categoryMap = new Map();
  const rootCategories = [];
  
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      _id: cat._id.toString(),
      idCategorieParent: cat.idCategorieParent ? cat.idCategorieParent.toString() : null,
      children: []
    });
  });
  
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
  const query = idBoutique ? { idBoutique } : {};
  const categories = await this.find(query).lean();
  const categoryMap = new Map();
  
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      _id: cat._id.toString(),
      idCategorieParent: cat.idCategorieParent ? cat.idCategorieParent.toString() : null,
      level: 0,
      path: []
    });
  });
  
  const calculateHierarchy = (categoryId, visited = new Set()) => {
    if (visited.has(categoryId)) return 0;
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

// ============================================
// MÉTHODES GLOBALES (toutes catégories, toutes boutiques)
// ============================================

// Méthode statique pour construire l'arbre des catégories GLOBAL
categorieSchema.statics.buildCategoryTreeGlobal = async function () {
  const categories = await this.find({}).lean();
  
  const categoryMap = new Map();
  const rootCategories = [];
  
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      _id: cat._id.toString(),
      idCategorieParent: cat.idCategorieParent ? cat.idCategorieParent.toString() : null,
      children: []
    });
  });
  
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

// Méthode statique pour obtenir toutes les catégories avec leur chemin hiérarchique (GLOBAL)
categorieSchema.statics.getCategoriesWithHierarchyGlobal = async function () {
  const categories = await this.find({}).lean();
  const categoryMap = new Map();
  
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      _id: cat._id.toString(),
      idCategorieParent: cat.idCategorieParent ? cat.idCategorieParent.toString() : null,
      level: 0,
      path: []
    });
  });
  
  const calculateHierarchy = (categoryId, visited = new Set()) => {
    if (visited.has(categoryId)) return 0;
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
