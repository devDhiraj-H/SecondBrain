import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { auther } from "./middlewares/auth.js";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { escape } from "querystring";
import { allowedNodeEnvironmentFlags } from "process";
import { markAsUntransferable } from "worker_threads";

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
      tags: [],
    });

    res.status(200).json({
      userId: req.userId,
      message: "data added succesfully",
    });
  }
});

app.get("/api/v1/content", auther, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(404).json({
      message: "Unauthorized",
    });
  }
  const content = await ContentModel.find({
    userId: userId,
  }).populate("userId", "username");

  res.json({
    content,
  });
});

app.delete("/api/v1/content", auther, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(404).json({
      message: "Unauthorized",
    });
  }

  const contentId = await ContentModel.find({
    userId: userId,
  });
  try {
    const deletedUser = await ContentModel.findOneAndDelete({
      _id: contentId,
      userId: userId,
    });
    res.status(200).json({
      message: "content deleted",
      deletedContent: deletedUser,
    });
  } catch (err) {
    res.status(404).json({
      message: "content not found",
    });
  }
});

app.post("/api/v1/brain/share", auther, async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(404).json({
      message: "Unauthorized",
    });
  }

  const { share } = req.body;

  if (share === true) {
    let existingLink = await LinkModel.findOne({
      userId,
    });

    if (!existingLink) {
      const hash = crypto.randomBytes(16).toString("hex");

      existingLink = await LinkModel.create({
        hash,
        userId,
      });
    }

    return res.json({
      message: "Brain shared successfully",
      shareUrl: `http:://localhost:3000/api/v1/brain/${existingLink.hash}`,
    });
  } else {
    await LinkModel.deleteOne({ userId });
    res.json({
      message: "link disabled",
    });
  }

  return res.json({
    message: "invalid value shared",
  });
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    return res.status(404).json({
      message: "invalid share link",
    });
  }

  const content = await ContentModel.find({
    userId: link.userId,
  }).populate("userId", "username");

  res.json({
    message: "data recieved",
    content,
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:3000}`);
});
