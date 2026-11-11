import express from "express";
import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ContentModel, UserModel } from "./db.js";
import { auther } from "./middlewares/auth.js";
import type { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());
const PORT = 3000;
dotenv.config();
const JWT_PASSWORD: string = process.env.JWT_PASSWORD ?? "w32342";

app.post("/api/v1/signup", (req, res) => {
  //add zod validation and hash password
  const username = req.body.username;
  const password = req.body.password;

  UserModel.create({
    username: username,
    password: password,
  });

  res.json({
    message: "user signed up",
  });
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await UserModel.findOne({
    username: username,
    password: password,
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_PASSWORD,
    );

    res.json({
      token: token,
    });
  } else {
    res.status(403).json({
      message: "Inccorect credentials",
    });
  }
});

app.post("/api/v1/content", auther, async (req: Request, res: Response) => {
  const { link, title } = req.body;

  if (req.userId === undefined) {
    res.status(404).json({
      message: "user not found",
    });
  } else {
    ContentModel.create({
      link,
      title,
      userId: req.userId,
      tags : []
    });

    res.status(200).json({
      userId : req.userId,
      "message" : "data added succesfully"
    })
  }
});

app.get("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});

app.post("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:3000}`);
});
