const mongoose = require("mongoose");

/**
 * Establishes MongoDB database connection
 * @returns {Promise<void>}
 */
const dbConnection = () => {
  // Mongoose connection options
  const options = {
    // Use new URL parser
    // useNewUrlParser: true, // No longer needed in Mongoose 6+
    // useUnifiedTopology: true, // No longer needed in Mongoose 6+
  };

  mongoose
    .connect(process.env.DB_URL, options)
    .then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
    })
    .catch((err) => {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    });

  // Handle connection events
  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB Error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB Disconnected");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  });
};

module.exports = dbConnection;
