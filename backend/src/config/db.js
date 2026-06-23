const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_project_db';
    // Mask password in logs for safety (matches: :password@)
    const maskedUri = uri.replace(/:([^:@]+)@/, ':******@');
    console.log(`Attempting connection to: ${maskedUri}`);

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
