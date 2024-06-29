import { Request, Response } from "express";
import { prisma } from "../config/db";

export const getTasks = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ error: "Not authoriized, please login or register" });
  }

  const { id } = req.user;

  try {
    const tasks = await prisma.task.findMany({
      where: { authorId: id },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).render("layouts/main", {
      title: "Tasks",
      body: "../partials/display",
      user: req.user,
      isAuthenticated: true,
      isLoading: false,
      tasks: tasks,
      isError: false,
      errorMessage: "",
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ isError: true, error: "Internal server error." });
  }
};

export const createTask = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ error: "Not authoriized, please login or register" });
  }

  const { id: userId } = req.user;
  const { task } = req.body;

  try {
    await prisma.task.create({
      data: {
        task,
        author: { connect: { id: userId } },
      },
    });

    const tasks = await prisma.task.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).render("partials/tasksDisplay", {
      title: "Tasks",
      // body: "../partials/tasks",
      user: req.user,
      isAuthenticated: true,
      isLoading: false,
      tasks: tasks,
      isError: false,
      errorMessage: "",
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ error: "Not authoriized, please login or register" });
  }

  const { id: userId } = req.user;
  const { id: taskId } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id: Number(taskId), authorId: userId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        completed: !task?.completed,
      },
    });

    const tasks = await prisma.task.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).render("partials/tasksDisplay", {
      title: "Tasks",
      // body: "../partials/tasks",
      user: req.user,
      isAuthenticated: true,
      isLoading: false,
      tasks: tasks,
      isError: false,
      errorMessage: "",
    });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ error: "Not authoriized, please login or register" });
  }

  const { id: userId } = req.user;
  const { id: taskId } = req.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id: Number(taskId), authorId: userId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.delete({
      where: { id: Number(taskId), authorId: userId },
    });

    const tasks = await prisma.task.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).render("partials/tasksDisplay", {
      title: "Tasks",
      // body: "../partials/tasks",
      user: req.user,
      isAuthenticated: true,
      isLoading: false,
      tasks: tasks,
      isError: false,
      errorMessage: "",
    });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
