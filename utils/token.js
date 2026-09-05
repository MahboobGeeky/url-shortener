import jwt from "jsonwebtoken";
import "dotenv/config";
import { userTokenSchema } from "../validation/token.validation.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken(payload) {
  const validationResult = await userTokenSchema.safeParseAsync(payload);

  if (!validationResult.success) {
    throw new Error(validationResult.error.message);
  }

  const payloadValidatedData = validationResult.data;

  const token = jwt.sign(payloadValidatedData, JWT_SECRET);
  return token;
}
