import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  isRegistered,
  logOut,
  resetPassword,
  forgotPassword,
} from "./controllers/auth.js";
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
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

//USER
router.get("/", isAuth, (req, res) => {
  return res.status(200).json({ username: req.session.username });
});

export default router;
