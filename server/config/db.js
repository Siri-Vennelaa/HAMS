const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, Node.js frequently fails SRV DNS queries with ECONNREFUSED
// Setting reliable public DNS servers (Google 8.8.8.8, 8.8.4.4) ensures Atlas mongodb+srv resolves reliably
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in server/.env');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error('[MongoDB] Check your MONGO_URI in server/.env and verify your MongoDB Atlas credentials & Network Access IP whitelist.');
    process.exit(1);
  }
};

module.exports = connectDB;
