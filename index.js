import express from "express";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import userRouter from './routes/user.route.js'

const PORT = process.env.PORT ?? 8000;

const app = express();


// middlewares
app.use(express.json());



const db = drizzle(process.env.DATABASE_URL);



app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running" });
});

app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
