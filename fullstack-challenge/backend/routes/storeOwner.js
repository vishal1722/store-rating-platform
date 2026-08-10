const express = require('express');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('store_owner'));

// GET /api/store-owner/dashboard -> raters list + average rating for the owner's store
router.get('/dashboard', async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.json({ store: null, averageRating: null, raters: [] });
    }

    const ratings = await Rating.find({ store: store._id }).populate('user', 'name email address');
    const averageRating = ratings.length
      ? Number((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(2))
      : null;

    const raters = ratings.map((r) => ({
      user: r.user,
      value: r.value,
      ratedAt: r.updatedAt,
    }));

    res.json({ store: { _id: store._id, name: store.name, email: store.email, address: store.address }, averageRating, raters });
  } catch (err) {
    res.status(500).json({ message: 'Could not load dashboard.', error: err.message });
  }
});

module.exports = router;
