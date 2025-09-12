// utils/jwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Tạo access token
export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Xác thực token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token không hợp lệ");
  }
};

// Decode token (không verify)
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateAccessToken,
  verifyToken,
  decodeToken,
};
