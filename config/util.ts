import jwt from "jsonwebtoken";

const { SECRET, REFRESH_SECRET } = process.env;

require("dotenv").config();

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export const generateAccessToken = (user: User) => {
  return jwt.sign(user, SECRET!, { expiresIn: "1h" });
};

export const generateRefreshToken = (user: User) => {
  return jwt.sign(user, REFRESH_SECRET!, { expiresIn: "15d" });
};
