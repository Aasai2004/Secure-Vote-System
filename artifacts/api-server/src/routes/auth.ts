import { Router, type IRouter } from "express";
import { db, votersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

declare module "express-serve-static-core" {
  interface Request {
    session?: { voterId?: number };
  }
}

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { aadharNumber, isAdmin } = parsed.data;

  const voter = await db.query.votersTable.findFirst({
    where: eq(votersTable.aadharNumber, aadharNumber),
  });

  if (!voter) {
    res.status(401).json({ error: "Aadhar number not registered. Please contact admin." });
    return;
  }

  if (isAdmin && !voter.isAdmin) {
    res.status(401).json({ error: "You do not have admin privileges." });
    return;
  }

  (req.session as any).voterId = voter.id;

  res.json({
    voter: {
      id: voter.id,
      name: voter.name,
      aadharNumber: voter.aadharNumber,
      hasVoted: voter.hasVoted,
      isAdmin: voter.isAdmin,
      createdAt: voter.createdAt.toISOString(),
    },
    message: "Login successful",
  });
});

router.post("/logout", (req, res) => {
  (req.session as any).voterId = undefined;
  req.session?.destroy?.(() => {});
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req, res) => {
  const voterId = (req.session as any)?.voterId;
  if (!voterId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const voter = await db.query.votersTable.findFirst({
    where: eq(votersTable.id, voterId),
  });

  if (!voter) {
    res.status(401).json({ error: "Voter not found" });
    return;
  }

  res.json({
    id: voter.id,
    name: voter.name,
    aadharNumber: voter.aadharNumber,
    hasVoted: voter.hasVoted,
    isAdmin: voter.isAdmin,
    hasFaceData: !!voter.faceDescriptor,
    createdAt: voter.createdAt.toISOString(),
  });
});

router.post("/verify-face", async (req, res) => {
  const voterId = (req.session as any)?.voterId;
  if (!voterId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const voter = await db.query.votersTable.findFirst({
    where: eq(votersTable.id, voterId),
  });

  if (!voter) {
    res.status(401).json({ error: "Voter not found" });
    return;
  }

  if (!voter.faceDescriptor) {
    res.json({ match: true, skipped: true, message: "No biometric data on file — proceeding" });
    return;
  }

  const { descriptor } = req.body;
  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    res.status(400).json({ error: "Invalid face descriptor" });
    return;
  }

  const stored: number[] = JSON.parse(voter.faceDescriptor);
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = (stored[i] ?? 0) - (descriptor[i] ?? 0);
    sum += diff * diff;
  }
  const distance = Math.sqrt(sum);
  const match = distance < 0.6;

  res.json({ match, distance: Math.round(distance * 1000) / 1000 });
});

export default router;
