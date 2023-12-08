import { registerUser, loginUser, sendOTP, verifyOTP, isRegistered, logOut } from "./controllers/auth.js";
import { isAuth } from "./lib/middlewares.js";
import { Router } from "express";
const router = Router();

//AUTH
router.post("/login", loginUser);
router.get("/logout", logOut);
router.post("/is-registered", isRegistered);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);

//USER
router.get("/", isAuth, (req, res) => {
    return res.status(200).send("AUTHORIZED");
  });

export default router;