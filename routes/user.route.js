import express from "express";
import db from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { authenticatedUser } from "../middlewares/auth.middleware.js";
import { signupPostRequestBodySchema } from "../validation/request.validation.js";
import z from "zod";
import { hashedPasswordWithSalt } from "../utils/hash.js";
import {getUserByEmail} from '../services/user.service.js'
const router = express.Router();

// routes

// current logged in user
router.get("/", authenticatedUser, async (req, res) => {
  const user = req.user;
  return res.status(201).json({ user });
});

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res.status(400).json({
      error: z.flattenError(validationResult.error),
    });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res
      .status(401)
      .json({ error: `user with this email ${email} already exist` });
  }

  // generated Hashed Password
  const {salt, password:hashedPassword} = hashedPasswordWithSalt(password);

  // user does not exist, add user into DB
  const [user] = await db
    .insert(usersTable)
    .values({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashedPassword,
      salt: salt,
    })
    .returning();

    const userId = user.id;

  return res.status(201).json({ status: "success", userId });

});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(email, usersTable.email));

  if (!existingUser) {
    return res
      .status(404)
      .json({ error: `User with this email ${email} does not exist` });
  }

  const salt = existingUser.salt;
  const hashedPassword = existingUser.password;

  const newHashed = createHmac("sha256", salt).update(password).digest("hex");

  if (hashedPassword !== newHashed) {
    return res.status(401).json({ error: `Password is incorrect` });
  }

  // create token for login session:-
  // create payload
  const payload = {
    id: existingUser.id,
    firstname: existingUser.firstname,
    lastname: existingUser.lastname,
    email: existingUser.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return res.status(201).json({ status: "success", token });
});

export default router;
