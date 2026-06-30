import "dotenv/config";

if (!process.env.NODE_ENV) {
  throw new Error("Node env not defined in environment variables");
}

const config = {
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  PORT: process.env.PORT,
  //   MONGO_URI:process.env.MONGO_URI,
};

export default config;
