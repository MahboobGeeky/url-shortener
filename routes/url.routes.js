import express from "express";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { shortenPostRequestBodySchema } from "../validation/request.validation.js";
import { db } from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { nanoid } from "nanoid";
import * as z from "zod";
import { flattenError } from "zod";
import { eq, and } from "drizzle-orm";

const router = express.Router();

router.post("/shorten", ensureAuthenticated, async (req, res) => {
  const validationResult = await shortenPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res
      .status(400)
      .json({ error: flattenError(validationResult.error) });
  }

  const { url, code } = validationResult.data;

  const shortCode = code || nanoid(6);

  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode: shortCode,
      targetURL: url,
      userId: req.user.id,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
    });

  return res.status(201).json({
    id: result.id,
    shortCode: result.shortCode,
    targetURL: result.targetURL,
  });
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;

  await db
    .delete(urlsTable)
    .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

  return res.status(200).json({ deleted: true });
});

// Get All Codes Of A User
router.get("/codes", ensureAuthenticated, async function (req, res) {
  const codes = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, req.user.id));

  return res.status(200).json({ codes });
});

router.get("/:shortcode", async (req, res) => {
  const code = req.params.shortcode;
  const [result] = await db
    .select({
      targetURL: urlsTable.targetURL,
    })
    .from(urlsTable)
    .where(eq(urlsTable.shortCode, code));

  if (!result) {
    return res.status(404).json({ error: "Invalid URL" });
  }

  return res.redirect(result.targetURL);
});

export default router;
