const mongoose = require('mongoose');

// Connecting directly to the shard host to bypass SRV DNS blockage
const uri = 'mongodb://amitpatilap986:AdminUser2026@ac-exo026n-shard-00-00.z6zap8z.mongodb.net:27017/college_project_db?ssl=true&authSource=admin';

console.log('Diagnostic: Testing direct shard connection to MongoDB Atlas...');

mongoose.connect(uri)
  .then(() => {
    console.log('DIAGNOSTIC SUCCESS: Successfully connected to your MongoDB Atlas cluster!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('DIAGNOSTIC FAILED: Connection rejected by MongoDB Atlas.');
    console.error('Error Details:', err.message);
    process.exit(1);
  });
