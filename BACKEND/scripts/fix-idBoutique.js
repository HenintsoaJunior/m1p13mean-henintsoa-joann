const mongoose = require('mongoose');
const Produit = require('../models/boutique/Produit');
const Boutique = require('../models/admin/Boutique');
const Utilisateur = require('../models/Utilisateur');

mongoose.connect('mongodb://localhost:27017/mean_db').then(async () => {
  const produits = await Produit.find({});
  console.log('Total produits:', produits.length);

  let fixed = 0;
  for (const p of produits) {
    const boutique = await Boutique.findById(p.idBoutique);
    if (!boutique) {
      const user = await Utilisateur.findById(p.idBoutique);
      if (user) {
        const actualBoutique = await Boutique.findOne({ 'contact.email': user.email });
        if (actualBoutique) {
          await Produit.updateOne({ _id: p._id }, { idBoutique: actualBoutique._id });
          console.log('Fixed:', p.nom, '-> boutique:', actualBoutique.contact.nom);
          fixed++;
        } else {
          console.log('No boutique found for user:', user.email, '| produit:', p.nom);
        }
      } else {
        console.log('idBoutique not a valid user/boutique:', p.idBoutique, '| produit:', p.nom);
      }
    }
  }
  console.log('Migration done. Fixed:', fixed, '/', produits.length);
  mongoose.disconnect();
}).catch(e => console.error(e));
