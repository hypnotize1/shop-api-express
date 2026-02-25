import "./configs/env.js";
import app from "./src/app.js";
import connectDB from "./src/db/mongoose.js";

connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `🚀 Server is running on port ${port} in ${process.env.NODE_ENV} mode`,
  );
});
