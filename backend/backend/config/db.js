const mongoose = require("mongoose");

let memoryServer = null;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  const poolOptions = {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 100, // Supports 2000+ concurrent students
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 10,  // Pre-warmed connections ready for spikes
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  if (mongoUri && !mongoUri.includes("<password>") && !mongoUri.includes("<user>")) {
    try {
      console.log("⏳ Connecting to configured MongoDB...");
      await mongoose.connect(mongoUri, poolOptions);
      console.log("✅ MongoDB connected successfully to primary database");
      return;
    } catch (err) {
      console.warn("⚠️ Primary MongoDB connection failed:", err.message);
      if (process.env.VERCEL || process.env.NODE_ENV === "production") {
        throw new Error(
          `MongoDB Atlas connection failed: ${err.message}. Please check Atlas Database Access credentials and ensure Network Access has 0.0.0.0/0 enabled.`
        );
      }
      console.log("🔄 Initializing high-speed local fallback database...");
    }
  } else {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw new Error(
        "MONGO_URI environment variable is not defined or is an unconfigured placeholder in production."
      );
    }
    console.log("ℹ️ No primary MONGO_URI configured in .env. Initializing local database...");
  }

  // Graceful local memory server fallback for seamless local execution
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const fallbackUri = memoryServer.getUri();
    await mongoose.connect(fallbackUri, poolOptions);
    console.log("✅ Local MongoDB connected successfully at:", fallbackUri);
  } catch (err) {
    console.error("❌ Failed to start database:", err);
    throw err;
  }
}

// Ensure clean disconnect on process termination
process.on("SIGINT", async () => {
  if (memoryServer) await memoryServer.stop();
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (memoryServer) await memoryServer.stop();
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = connectDB;
