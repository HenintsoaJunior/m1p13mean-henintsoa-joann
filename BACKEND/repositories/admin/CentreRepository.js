const Centre = require("../../models/admin/Centre");

class CentreRepository {
  async create(data) {
    return await Centre.create(data);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { cree_le: -1 } } = options;
    const skip = (page - 1) * limit;

    const centres = await Centre.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Centre.countDocuments(filters);

    return { centres, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return await Centre.findById(id);
  }

  async findBySlug(slug) {
    return await Centre.findOne({ slug });
  }

  async update(id, data) {
    return await Centre.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Centre.findByIdAndDelete(id);
  }

  async findNear(longitude, latitude, maxDistance = 10000) {
    return await Centre.find({
      "adresse.coordonnees": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    });
  }
}

module.exports = new CentreRepository();
