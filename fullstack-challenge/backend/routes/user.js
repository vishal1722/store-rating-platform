const express = require('express');
const mongoose = require('mongoose');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');
const { validateRating } = require('../utils/validators');

const router = express.Router();
router.use(protect, authorize('user'));

// GET /api/user/stores -> list stores with overall rating + this user's own rating, searchable & sortable
router.get('/stores', async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.address) filter.address = { $regex: req.query.address, $options: 'i' };

    const sortField = ['name', 'address', 'createdAt'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'name';
    const order = req.query.order === 'desc' ? -1 : 1;

    const stores = await Store.find(filter).sort({ [sortField]: order });
    const storeIds = stores.map((s) => s._id);

    const [averages, myRatings] = await Promise.all([
      Rating.aggregate([
        { $match: { store: { $in: storeIds } } },
        { $group: { _id: '$store', avg: { $avg: '$value' } } },
      ]),
      Rating.find({ store: { $in: storeIds }, user: req.user._id }),
    ]);

    const avgByStore = new Map(averages.map((a) => [String(a._id), a.avg]));
    const myRatingByStore = new Map(myRatings.map((r) => [String(r.store), r.value]));

    const result = stores.map((s) => ({
      _id: s._id,
      name: s.name,
      address: s.address,
      email: s.email,
      overallRating: avgByStore.has(String(s._id)) ? Number(avgByStore.get(String(s._id)).toFixed(2)) : null,
      myRating: myRatingByStore.get(String(s._id)) || null,
    }));

    res.json({ stores: result });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch stores.', error: err.message });
  }
});

// POST /api/user/stores/:id/rating -> submit or update a rating
router.post('/stores/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid store id.' });
    }
    const error = validateRating(req.body.value);
    if (error) return res.status(400).json({ message: error });

    const store = await Store.findById(id);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const rating = await Rating.findOneAndUpdate(
      { store: id, user: req.user._id },
      { $set: { value: req.body.value } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({ rating });
  } catch (err) {
    res.status(500).json({ message: 'Could not submit rating.', error: err.message });
  }
});

module.exports = router;
