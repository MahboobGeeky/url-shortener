import express from "express";
import db from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
import { authenticatedUser } from "../middlewares/auth.middleware.js";
import {
  signupPostRequestBodySchema,
  loginPostRequestBodySchema,
} from "../validation/request.validation.js";
import z from "zod";
import { hashPasswordWithSalt } from "../utils/hash.js";
import {createUserToken} from '../utils/token.js'
import { getUserByEmail } from "../services/user.service.js";
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
  const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

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

  const validationResult = await loginPostRequestBodySchema.safeParseAsync(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: z.flattenError(validationResult.error),
    });
  }

  const { email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return res
      .status(404)
      .json({ error: `User with this email ${email} does not exist` });
  }

  const salt = existingUser.salt;
  // const hashedPassword = existingUser.password

  const {password: hashedPassword} = hashPasswordWithSalt(password, salt);

  if (hashedPassword !== existingUser.password) {
    return res.status(401).json({ error: `Invalid Password` });
  }

  // create token for login session:-
  const token = await createUserToken({id: existingUser.id});

  return res.status(201).json({ status: "success", token });
});

export default router;
