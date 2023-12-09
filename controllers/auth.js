import users from "../models/user.js";
import { sendMail, removeExpiredUserSessions, revokeUserSessions } from "../lib/helpers.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import { redisClient } from "../server.js";

//LOGIN
export const loginUser = async (req, res) => {
  try {
    if (req.session.username) {
      return res.status(400).send("Already logged in!");
    }

    //Form Validation
    const loginSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      remember_me: Joi.boolean().required(),
    });
    await loginSchema.validateAsync(req.body);

    //Search in DB
    const { email, password, remember_me } = req.body;
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(404).send("Not registered!");
    }

    //Verify Password
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (passwordCorrect) {
      req.session.username = user.email;
      req.session.role = user.role;
      if (remember_me) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 1 month
      }

      // Update active-sessions of user
      redisClient.SADD(
        `user-sess:${user.email}`,
        req.sessionID,
        (err, result) => {
          if (err) {
            console.error("Error adding session to active sessions:", err);
          }
        }
      );

      removeExpiredUserSessions(user.email);

      return res.status(200).json({
        email: user.email,
        role: user.role,
        message: `Login Successful`,
      });
    } else {
      return res.status(400).send("Wrong Password");
    }
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).send(error.message);
  }
};

//LOGOUT
export const logOut = (req, res) => {
  if(!req.session.username) {
    return res.status(400).send("Not logged in!");
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }

    res.clearCookie("sid");
    return res.json("Logged out successfully");
  });
};

//IS REGISTERED
export const isRegistered = async (req, res) => {
  try {
    const email = req.body.email;

    // isRegistered
    const user = await users.findOne({ email }, { _id: 0, email: 1 });
    if (user) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//SEND OTP
export const sendOTP = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json("No email provided!");
    }

    if (req.session.username) {
      return res.status(403).json("Already logged in");
    }

    if (
      req.session.otpExpiry &&
      Date.now() < req.session.otpExpiry &&
      req.body.email === req.session.email
    ) {
      return res.status(400).send("OTP not expired");
    }

    // Email Validation
    const emailSchema = Joi.object({
      email: Joi.string().email().required(),
    });
    await emailSchema.validateAsync({ email: req.body.email });

    // Generate OTP and store in DB
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const mailOptions = {
      from: process.env.GMAIL_ID,
      to: req.body.email,
      subject: `facOTTry - Your OTP for verification is ${otp}`,
      html: `<p>Hello,</p>
             <p>Your OTP for verification is: <strong>${otp}</strong></p>
             <p>Thank you for using facOTTry!</p>`,
    };

    const result = await sendMail(mailOptions);
    if (result.accepted) {
      // Store temporary information
      req.session.otp = otp;
      req.session.email = req.body.email;
      req.session.otpExpiry = Date.now() + 180000; //5 Minutes from now

      return res.json(result);
    }

    res.status(500).send("Error sending OTP");
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).json(error.message);
  }
};

//VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const userEnteredOTP = req.body.otp;
    const storedOTP = req.session.otp;
    const storedOTPExpiry = req.session.otpExpiry;

    if (!req.session.otp || !req.session.otpExpiry || !req.session.email) {
      return res.status(400).send("Not generated");
    }

    if (Date.now() > storedOTPExpiry) {
      delete req.session.otp;
      delete req.session.email;
      delete req.session.otpExpiry;
      return res.status(401).send("OTP expired");
    }

    // Master OTP
    if (userEnteredOTP === "998877") {
      delete req.session.otp;
      delete req.session.otpExpiry;
      req.session.tempSessionExp = Date.now() + 300000; //5 Minutes from now
      return res.send("OTP Verified");
    } else {
      if (userEnteredOTP === storedOTP) {
        delete req.session.otp;
        delete req.session.otpExpiry;
        req.session.tempSessionExp = Date.now() + 300000; //5 Minutes from now
        return res.send("OTP Verified");
      } else {
        return res.status(403).send("Wrong OTP");
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//REGISTER
export const registerUser = async (req, res) => {
  try {
    if(req.session.username) {
      return res.status(400).send("Already logged in!");
    }

    const email = req.session.email;
    const { password } = req.body;

    if (req.session.username) {
      return res.status(400).json("Already logged in!");
    }

    if (
      !req.session.tempSessionExp ||
      Date.now() > req.session.tempSessionExp
    ) {
      return res.status(401).send("Session Expired!");
    }

    //Request Body Validation
    const registerSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    await registerSchema.validateAsync(req.body);

    const profilePic =
      "https://res.cloudinary.com/dqjkucbjn/image/upload/v1688890088/Avatars/thumbs-1688889944751_w9xb0e.svg";

    // Hash password & save to mongoDB
    const hash = await bcrypt.hash(password, 12);
    const newUser = new users({
      email,
      password: hash,
      profilePic,
      role: "user",
    });
    await newUser.save();

    delete req.session.tempSessionExp;
    delete req.session.email;

    return res.status(200).json({ message: "User registered" });
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).json(error.message);
  }
};

//RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    let id = null;
    if (req.session.username) {
      id = req.session.username;
    } else {
      id = req.session.email;
    }

    if (
      (!id && !req.session.tempSessionExp) ||
      Date.now() > req.session.tempSessionExp
    ) {
      return res.status(401).send("Session Expired!");
    }

    const { currentPassword, newPassword } = req.body;

    const user = await users.findOne(
      { $or: [{ email: id }] },
      { password: 1, email: 1 }
    );

    // Same Password Check
    if (newPassword === currentPassword) {
      return res.status(400).send("Old & new password cannot be same");
    }

    if (!user) {
      return res.status(404).send("Not registered!");
    }

    // Match Current Password
    if (currentPassword) {
      const passwordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordCorrect) {
        return res.status(400).send("Current Password doesn't match");
      }
    }

    //newPassword Validation
    const passwordSchema = Joi.object({
      password: Joi.string().required(),
    });

    await passwordSchema.validateAsync({ password: newPassword });

    // Save new password to mongoDB
    const newHash = await bcrypt.hash(newPassword, 12);
    user.password = newHash;
    await user.save();

    // Revoke all active user sessions
    revokeUserSessions(user.email);
    if (req.session.email) delete req.session.email;
    delete req.session.req.session.tempSessionExp;

    return res.json("Password Reset Successful!");
  } catch (error) {
    if (error.details) {
      return res
        .status(422)
        .json(error.details.map((detail) => detail.message).join(", "));
    }

    return res.status(500).json(error.message);
  }
};