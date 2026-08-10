const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

const router = express.Router();
router.use(protect, authorize('admin'));

// Builds a case-insensitive partial-match filter for a set of fields.
function buildTextFilter(query, fields) {
  const filter = {};
  fields.forEach((field) => {
    if (query[field]) {
      filter[field] = { $regex: query[field], $options: 'i' };
    }
  });
  return filter;
}

function buildSort(query, allowedFields, defaultField = 'createdAt') {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = query.order === 'desc' ? -1 : 1;
  return { [sortBy]: order };
}

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Rating.countDocuments(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Could not load dashboard.', error: err.message });
  }
});

// POST /api/admin/users -> create a user of any role (admin/user/store_owner)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);

    const allowedRoles = ['admin', 'user', 'store_owner'];
    if (role && !allowedRoles.includes(role)) errors.push('Invalid role.');
    if (errors.length) return res.status(400).json({ message: errors[0], errors });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, address, password, role: role || 'user' });
    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Could not create user.', error: err.message });
  }
});

// GET /api/admin/users -> list normal + admin + store_owner users, filterable & sortable
router.get('/users', async (req, res) => {
  try {
    const filter = buildTextFilter(req.query, ['name', 'email', 'address']);
    if (req.query.role) filter.role = req.query.role;

    const sort = buildSort(req.query, ['name', 'email', 'address', 'role', 'createdAt']);
    const users = await User.find(filter).sort(sort).select('-password');

    // Attach average rating for store owners
    const storeOwnerIds = users.filter((u) => u.role === 'store_owner').map((u) => u._id);
    const stores = await Store.find({ owner: { $in: storeOwnerIds } });
    const storeByOwner = new Map(stores.map((s) => [String(s.owner), s]));

    const ratingAverages = await Rating.aggregate([
      { $match: { store: { $in: stores.map((s) => s._id) } } },
      { $group: { _id: '$store', avg: { $avg: '$value' } } },
    ]);
    const avgByStore = new Map(ratingAverages.map((r) => [String(r._id), r.avg]));

    const result = users.map((u) => {
      const obj = u.toObject();
      if (u.role === 'store_owner') {
        const store = storeByOwner.get(String(u._id));
        obj.rating = store ? Number((avgByStore.get(String(store._id)) || 0).toFixed(2)) : null;
      }
      return obj;
    });

    res.json({ users: result });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch users.', error: err.message });
  }
});

// GET /api/admin/users/:id -> single user detail (with rating if store owner)
router.get('/users/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const result = user.toObject();
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ owner: user._id });
      if (store) {
        const agg = await Rating.aggregate([
          { $match: { store: store._id } },
          { $group: { _id: '$store', avg: { $avg: '$value' } } },
        ]);
        result.rating = agg.length ? Number(agg[0].avg.toFixed(2)) : null;
        result.storeName = store.name;
      }
    }
    res.json({ user: result });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch user.', error: err.message });
  }
});

// POST /api/admin/stores -> create a store, optionally linking/creating an owner
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const errors = [validateName(name), validateEmail(email), validateAddress(address)].filter(Boolean);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });

    const existing = await Store.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'A store with this email already exists.' });

    let owner = null;
    if (ownerId) {
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).json({ message: 'Invalid ownerId.' });
      }
      owner = await User.findById(ownerId);
      if (!owner || owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'ownerId must reference an existing store_owner user.' });
      }
    }

    const store = await Store.create({ name, email, address, owner: owner ? owner._id : null });
    if (owner) {
      owner.store = store._id;
      await owner.save();
    }
    res.status(201).json({ store });
  } catch (err) {
    res.status(500).json({ message: 'Could not create store.', error: err.message });
  }
});

// GET /api/admin/stores -> list stores with average rating, filterable & sortable
router.get('/stores', async (req, res) => {
  try {
    const filter = buildTextFilter(req.query, ['name', 'email', 'address']);
    const sort = buildSort(req.query, ['name', 'email', 'address', 'createdAt']);
    const stores = await Store.find(filter).sort(sort);

    const ratingAverages = await Rating.aggregate([
      { $match: { store: { $in: stores.map((s) => s._id) } } },
      { $group: { _id: '$store', avg: { $avg: '$value' }, count: { $sum: 1 } } },
    ]);
    const avgByStore = new Map(ratingAverages.map((r) => [String(r._id), r]));

    const result = stores.map((s) => {
      const obj = s.toObject();
      const agg = avgByStore.get(String(s._id));
      obj.rating = agg ? Number(agg.avg.toFixed(2)) : null;
      obj.ratingCount = agg ? agg.count : 0;
      return obj;
    });

    res.json({ stores: result });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch stores.', error: err.message });
  }
});

module.exports = router;
