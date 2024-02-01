import { registerUser, loginUser, sendOTP, verifyOTP, isRegistered, logOut, resetPassword, forgotPassword } from "./controllers/auth.js";
import { isAuth } from "./lib/middlewares.js";
import { Router } from "express";
const router = Router();

//AUTH
router.post("/auth/login", loginUser);
router.get("/auth/logout", logOut);
router.post("/auth/is-registered", isRegistered);
router.post("/auth/send-otp", sendOTP);
router.post("/auth/verify-otp", verifyOTP);
router.post("/auth/register", registerUser);
router.post("/auth/forgot", forgotPassword);
router.post("/auth/reset", resetPassword);

//USER
router.get("/", isAuth, (req, res) => {
    return res.status(200).send("AUTHORIZED");
  });

export default router;