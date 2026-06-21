const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://swetha:swetha123@cluster0.8cyerw3.mongodb.net/studentmentalhealth?retryWrites=true&w=majority&appName=Cluster0";

  await mongoose.connect(mongoUri);

  console.log("✅ MongoDB connected");
}

module.exports = connectDB;
