import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import router from "./router.js";
import { createClient } from "redis";
import RedisStore from "connect-redis";
import session from "express-session";

// Const declarations
dotenv.config();
const app = express();
const PORT = process.env.PORT;
const MONG_URI = process.env.MONG_URI;

// Configure Redis Client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});
redisClient.connect().then(console.log("Redis Connected")).catch(console.error);

// Middlewares
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://facottry-website.vercel.app", 
        ]
      : "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    credentials: true,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      expires: null,
    },
  })
);

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(express.json());
app.use(morgan("tiny"));
app.use(helmet());
export { redisClient };

// Database Connenction
mongoose
  .connect(MONG_URI)
  .then(
    app.listen(PORT, () => {
      if (process.env.NODE_ENV === "production") {
        console.log("Production Ready");
      } else {
        console.log(`Server:http://localhost:${PORT}/`);
      }
    })
  )
  .catch((err) => {
    console.log(err);
  });

// Root Route
app.get("/", (req, res) => {
  return res.send("FacOTTry");
});

app.use("/api", router);