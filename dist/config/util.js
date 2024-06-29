"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = exports.cn = void 0;
const clsx_1 = require("clsx");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tailwind_merge_1 = require("tailwind-merge");
const { SECRET, REFRESH_SECRET } = process.env;
require("dotenv").config();
const cn = (...inputs) => {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
};
exports.cn = cn;
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign(user, SECRET, { expiresIn: "1h" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign(user, REFRESH_SECRET, { expiresIn: "15d" });
};
exports.generateRefreshToken = generateRefreshToken;
