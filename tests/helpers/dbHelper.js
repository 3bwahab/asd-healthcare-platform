/**
 * Database Helper for Testing
 * Provides utilities for setting up and tearing down test database
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

/**
 * Connect to in-memory MongoDB database for testing
 */
const connect = async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Disconnect from any existing connection
  await mongoose.disconnect();

  // Connect to in-memory database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("📦 Connected to in-memory MongoDB");
};

/**
 * Close database connection and stop MongoDB instance
 */
const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log("🔒 Closed in-memory MongoDB connection");
};

/**
 * Clear all collections in the database
 */
const clearDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  const {collections} = mongoose.connection;

  const collectionNames = Object.keys(collections);
  for (let i = 0; i < collectionNames.length; i += 1) {
    const collection = collections[collectionNames[i]];
    // eslint-disable-next-line no-await-in-loop
    await collection.deleteMany({});
  }

  console.log("🗑️  Cleared all database collections");
};

/**
 * Drop all collections in the database
 */
const dropCollections = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  const {collections} = mongoose.connection;

  const collectionNames = Object.keys(collections);
  for (let i = 0; i < collectionNames.length; i += 1) {
    const collection = collections[collectionNames[i]];
    try {
      // eslint-disable-next-line no-await-in-loop
      await collection.drop();
    } catch (error) {
      // Ignore error if collection doesn't exist
      if (error.message !== "ns not found") {
        throw error;
      }
    }
  }

  console.log("🗑️  Dropped all database collections");
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase,
  dropCollections,
};
