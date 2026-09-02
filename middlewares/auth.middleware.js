import express from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const authenticatedUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // payload -> user
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  req.user = payload;

  next();
};

