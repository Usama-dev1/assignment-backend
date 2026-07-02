import "dotenv/config";

if (!process.env.NODE_ENV) {
  throw new Error("Node env not defined in environment variables");
}

if (!process.env.PORT) {
  throw new Error("Port not defined in environment variables");
}
if (!process.env.MONGO_URI) {
  throw new Error("Mongo URI not defined in environment variables");
}
if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET not defined in environment variables");
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET not defined in environment variables");
}

const config = {
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
};

export default config;
