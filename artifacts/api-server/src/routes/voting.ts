import { Router, type IRouter } from "express";
import { db, votersTable, candidatesTable, votesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CastVoteBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/cast", async (req, res) => {
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

  if (voter.hasVoted) {
    res.status(400).json({ error: "You have already cast your vote" });
    return;
  }

  const parsed = CastVoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { candidateId } = parsed.data;

  const candidate = await db.query.candidatesTable.findFirst({
    where: eq(candidatesTable.id, candidateId),
  });

  if (!candidate) {
    res.status(400).json({ error: "Invalid candidate" });
    return;
  }

  await db.update(candidatesTable)
    .set({ voteCount: sql`${candidatesTable.voteCount} + 1` })
    .where(eq(candidatesTable.id, candidateId));

  await db.update(votersTable)
    .set({ hasVoted: true })
    .where(eq(votersTable.id, voterId));

  await db.insert(votesTable).values({
    voterId: voter.id,
    candidateId: candidate.id,
  });

  res.json({ message: "Vote cast successfully" });
});

export default router;
