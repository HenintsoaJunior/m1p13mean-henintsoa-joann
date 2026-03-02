const mongoose = require("mongoose");
const boutiqueRepository = require("../../repositories/admin/BoutiqueRepository");
const Boutique = require("../../models/admin/Boutique");
const AppelOffre = require("../../models/admin/AppelOffre");
const Emplacement = require("../../models/admin/Emplacement");
const Utilisateur = require("../../models/Utilisateur");

class BoutiqueService {
  async createBoutique(data) {
    return await boutiqueRepository.create(data);
  }

  async getAllBoutiques(filters = {}, options = {}) {
    return await boutiqueRepository.findAll(filters, options);
  }

  async getBoutiqueById(id) {
    const boutique = await boutiqueRepository.findById(id);
    if (!boutique) {
      throw new Error("Boutique non trouvée");
    }
    return boutique;
  }

  async getBoutiquesByAppelOffre(appelOffreId, options = {}) {
    return await boutiqueRepository.findByAppelOffre(appelOffreId, options);
  }

  async getBoutiquesByStatut(statut, options = {}) {
    return await boutiqueRepository.findByStatut(statut, options);
  }

  async updateBoutique(id, data) {
    const boutique = await boutiqueRepository.update(id, data);
    if (!boutique) {
      throw new Error("Boutique non trouvée");
    }
    return boutique;
  }

  async deleteBoutique(id) {
    const boutique = await boutiqueRepository.deleteById(id);
    if (!boutique) {
      throw new Error("Boutique non trouvée");
    }
    return boutique;
  }

  async desactiverBoutique(id) {
    const boutique = await Boutique.findById(id).populate({
      path: "appel_offre_id",
      populate: { path: "emplacement_id" },
    });
    if (!boutique) throw new Error("Boutique non trouvée");

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // 1. Boutique → fermée
      boutique.statut = "fermee";
      await boutique.save({ session });

      // 2. AppelOffre → fermé
      if (boutique.appel_offre_id) {
        await AppelOffre.findByIdAndUpdate(
          boutique.appel_offre_id._id,
          { statut: "ferme" },
          { session }
        );

        // 3. Emplacement → libre
        if (boutique.appel_offre_id.emplacement_id) {
          await Emplacement.findByIdAndUpdate(
            boutique.appel_offre_id.emplacement_id._id,
            { statut: "libre" },
            { session }
          );
        }
      }

      // 4. Utilisateur → actif = false (relation par email)
      if (boutique.contact?.email) {
        await Utilisateur.findOneAndUpdate(
          { email: boutique.contact.email.toLowerCase().trim() },
          { actif: false },
          { session }
        );
      }

      await session.commitTransaction();
      return boutique;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new BoutiqueService();
