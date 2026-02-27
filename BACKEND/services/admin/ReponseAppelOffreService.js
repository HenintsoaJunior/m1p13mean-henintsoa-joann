const reponseRepo = require("../../repositories/admin/ReponseAppelOffreRepository");
const AppelOffre = require("../../models/admin/AppelOffre");
const Emplacement = require("../../models/admin/Emplacement");

class ReponseService {
  async createReponse(data) {
    const { appel_offre_id } = data;

    const appel = await AppelOffre.findById(appel_offre_id);
    if (!appel) throw new Error("Appel d'offre introuvable");
    if (appel.statut !== "ouvert") throw new Error("Appel d'offre non ouvert à la réponse");

    const reponse = await reponseRepo.create(data);
    return { message: "Réponse créée", reponse };
  }

  async getReponsesByAppel(appelId, options = {}) {
    return await reponseRepo.findByAppelOffre(appelId, options);
  }

  async acceptReponse(reponseId) {
    const reponse = await reponseRepo.findById(reponseId);
    if (!reponse) throw new Error("Réponse introuvable");
    if (reponse.statut === "accepte") throw new Error("Réponse déjà acceptée");

    // Mettre à jour la réponse
    const updated = await reponseRepo.update(reponseId, { statut: "accepte", modifie_le: new Date() });

    // Mettre à jour l'appel d'offre
    await AppelOffre.findByIdAndUpdate(reponse.appel_offre_id, { statut: "attribue" });

    // Mettre à jour l'emplacement
    const appel = await AppelOffre.findById(reponse.appel_offre_id);
    if (appel && appel.emplacement_id) {
      await Emplacement.findByIdAndUpdate(appel.emplacement_id, { statut: "occupe" });
    }

    // Refuser les autres réponses
    await reponseRepo.updateMany({ appel_offre_id: reponse.appel_offre_id, _id: { $ne: reponseId } }, { statut: "refuse" });

    return { message: "Réponse acceptée", reponse: updated };
  }

  async refuseReponse(reponseId) {
    const reponse = await reponseRepo.findById(reponseId);
    if (!reponse) throw new Error("Réponse introuvable");
    if (reponse.statut === "refuse") throw new Error("Réponse déjà refusée");

    const updated = await reponseRepo.update(reponseId, { statut: "refuse", modifie_le: new Date() });
    return { message: "Réponse refusée", reponse: updated };
  }
}

module.exports = new ReponseService();
