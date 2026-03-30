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
    createdAt: voter.createdAt.toISOString(),
  });
});

export default router;
