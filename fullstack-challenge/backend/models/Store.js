const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 20, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true, maxlength: 400 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
