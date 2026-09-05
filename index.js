import express from "express";
import "dotenv/config";
import userRouter from "./routes/user.routes.js";
import { authenticationMiddleware } from "./middlewares/auth.middleware.js";

const PORT = process.env.PORT ?? 8000;

const app = express();

// middlewares
app.use(express.json());

app.use(authenticationMiddleware);

app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running" });
});

app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
