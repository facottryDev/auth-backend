import nodemailer from "nodemailer";
import crypto from "crypto";

// Send Email
export const sendMail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_APP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(info);
    return info;
  } catch (error) {
    return error.message;
  }
};

export const generateSecretKey = () => {
  const secret = crypto.randomBytes(64).toString("hex");
  return secret;
};

export const removeExpiredUserSessions = async (username) => {
  try {
    const sessionIds = await redisClient.sMembers(`user-sess:${username}`);

    for (const sessionId of sessionIds) {
      const sessionExists = await redisClient.exists(`sess:${sessionId}`);
      if (!sessionExists) {
        await redisClient.sRem(`user-sess:${username}`, sessionId);
      }
    }

    console.log(`Expired members removed for ${username}`);
  } catch (err) {
    console.error(err);
  }
};
