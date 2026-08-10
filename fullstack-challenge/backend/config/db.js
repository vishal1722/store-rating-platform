const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri || uri.includes('<') || uri.trim().endsWith(';')) {
      console.error(
        'Invalid or missing MONGO_URI. Update backend/.env with a valid MongoDB connection string (no angle brackets or trailing semicolon).',
      );
      console.error(
        'Example: mongodb+srv://<user>:<password>@cluster0.yp8qo7q.mongodb.net/yourDB?retryWrites=true&w=majority',
      );
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
