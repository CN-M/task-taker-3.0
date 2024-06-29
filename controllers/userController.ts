import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/db";
import { generateAccessToken, generateRefreshToken } from "../config/util";

require("dotenv").config();

const { REFRESH_SECRET, NODE_ENV } = process.env;

require("dotenv").config();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const userExists = await prisma.user.findFirst({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    if (newUser) {
      const { id, firstName, lastName, email } = newUser;

      const accessToken = generateAccessToken({
        id,
        firstName,
        lastName,
        email,
      });

      const refreshToken = generateRefreshToken({
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

      const tasks = await prisma.task.findMany({
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
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password!);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const { id, firstName, lastName, email: userEmail } = user;

    const accessToken = generateAccessToken({
      id,
      firstName,
      lastName,
      email,
    });

    const refreshToken = generateRefreshToken({
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

    const tasks = await prisma.task.findMany({
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
  } catch (err) {
    console.error("Error logging in user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error("Error logging out user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return res.status(401).json({ error: "Not authorised, no refresh token!" });
  }

  try {
    const { id } = jwt.verify(refreshToken, REFRESH_SECRET!) as JwtPayload;

    const user = await prisma.user.findFirst({
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

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    console.log("User token successfully refreshed");

    req.user = user;
  } catch (err) {
    console.error("Error:", err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName } = req.body;

    if (!req.user) {
      return res
        .status(400)
        .json({ error: "Not authoriized, please login or register" });
    }

    const { id: userId } = req.user;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
      },
      select: { firstName: true, lastName: true, email: true },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ error: "Not authoriized, please login or register" });
  }

  const { id: userId } = req.user;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });

    res.status(200).json({ message: "User deleted", user: deletedUser });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
