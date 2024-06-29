import "colors";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

dotenv.config();

import { catch404, errorHandler } from "./middleware/errorMiddleware";

// Import Routes
import taskRoute from "./routes/taskRoute";
import userRoute from "./routes/userRoute";

const { PORT, NODE_ENV } = process.env;
const port = PORT || 3000;
const node_env = NODE_ENV || "development";

const app: Express = express();

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "dist")));

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", async (req, res) => {
//   const tasks = await getTasks(req, res);

//   res.render("layouts/main", {
//     title: "Tasks",
//     body: "../tasks/tasks",
//     user: req.user,
//     isAuthenticated: true,
//     isLoading: false,
//     // tasks: tasks,
//     isError: false,
//     errorMessage: "",
//   });
// });

app.get("/register", async (req, res) => {
  res.render("layouts/main", {
    title: "Register",
    body: "../auth/register",
    user: req.user ? req.user : null,
    isAuthenticated: req.user ? true : false,
    isError: false,
  });
});

app.get("/login", (req, res) => {
  res.render("layouts/main", {
    title: "Login",
    body: "../auth/login",
    user: req.user ? req.user : null,
    isAuthenticated: req.user ? true : false,
    isError: false,
    errorMessage: "",
  });
});

// app.use("/", pagesRoute);
app.use("/account", userRoute);
app.use("/", taskRoute);

// Error Middleware
app.use(catch404);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`.cyan);
});
