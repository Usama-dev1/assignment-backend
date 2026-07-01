import app from "./src/app.js";
import connectDB from "./src/config/connectDb.js";
import config from "./src/config/config.js";
connectDB();
if (config.NODE_ENV !== "production") {
  const PORT = config.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
