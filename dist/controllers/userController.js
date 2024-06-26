"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.refreshUser = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const util_1 = require("../config/util");
require("dotenv").config();
const { REFRESH_SECRET, NODE_ENV } = process.env;
require("dotenv").config();
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, firstName, lastName, password } = req.body;
        if (!email || !firstName || !lastName || !password) {
            return res.status(400).json({ error: "Please fill in all fields" });
        }
        const userExists = yield db_1.prisma.user.findFirst({
            where: { email },
        });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const newUser = yield db_1.prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
            },
        });
        if (newUser) {
            const { id, firstName, lastName, email } = newUser;
            const accessToken = (0, util_1.generateAccessToken)({
                id,
                firstName,
                lastName,
                email,
            });
            const refreshToken = (0, util_1.generateRefreshToken)({
                id,
                firstName,
                lastName,
                email,
            });
            const authedUser = {
                firstName,
                lastName,
            };
            res
                .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 1 * 60 * 60 * 1000, // 1 hour
            })
                .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 15 * 24 * 60 * 60 * 1000, // 15 Days
            });
            const tasks = yield db_1.prisma.task.findMany({
                where: { authorId: id },
                orderBy: { createdAt: "asc" },
            });
            res.status(200).render("partials/display", {
                title: "Tasks",
                // body: "../partials/display",
                user: authedUser,
                isAuthenticated: true,
                isLoading: false,
                tasks: tasks,
                isError: false,
                errorMessage: "",
            });
        }
        else {
            return res.status(400).json({ error: "Invalid user data" });
        }
    }
    catch (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill in all fields" });
        }
        const user = yield db_1.prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const { id, firstName, lastName, email: userEmail } = user;
        const accessToken = (0, util_1.generateAccessToken)({
            id,
            firstName,
            lastName,
            email,
        });
        const refreshToken = (0, util_1.generateRefreshToken)({
            id,
            firstName,
            lastName,
            email,
        });
        const authedUser = {
            firstName,
            lastName,
        };
        res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 Days
        });
        const tasks = yield db_1.prisma.task.findMany({
            where: { authorId: id },
            orderBy: { createdAt: "asc" },
        });
        res.status(200).render("partials/display", {
            title: "Tasks",
            // body: "../partials/display",
            user: authedUser,
            isAuthenticated: true,
            isLoading: false,
            tasks: tasks,
            isError: false,
            errorMessage: "",
        });
    }
    catch (err) {
        console.error("Error logging in user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .render("auth/login", {
            title: "Login",
            // body: "../auth/login",
            user: req.user ? req.user : null,
            isAuthenticated: req.user ? true : false,
            isError: false,
            errorMessage: "",
        });
    }
    catch (err) {
        console.error("Error logging out user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.logoutUser = logoutUser;
const refreshUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
        return res.status(401).json({ error: "Not authorised, no refresh token!" });
    }
    try {
        const { id } = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        const user = yield db_1.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                password: false,
            },
        });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const newAccessToken = (0, util_1.generateAccessToken)(user);
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
        });
        console.log("User token successfully refreshed");
        req.user = user;
    }
    catch (err) {
        console.error("Error:", err);
        return res.status(401).json({ error: "Invalid refresh token" });
    }
});
exports.refreshUser = refreshUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName } = req.body;
        if (!req.user) {
            return res
                .status(400)
                .json({ error: "Not authoriized, please login or register" });
        }
        const { id: userId } = req.user;
        const updatedUser = yield db_1.prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
            },
            select: { firstName: true, lastName: true, email: true },
        });
        res.status(200).json(updatedUser);
    }
    catch (err) {
        console.error("Error updating user data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res
            .status(400)
            .json({ error: "Not authoriized, please login or register" });
    }
    const { id: userId } = req.user;
    try {
        const deletedUser = yield db_1.prisma.user.delete({
            where: { id: userId },
            select: { firstName: true, lastName: true, email: true },
        });
        res.status(200).json({ message: "User deleted", user: deletedUser });
    }
    catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.deleteUser = deleteUser;
