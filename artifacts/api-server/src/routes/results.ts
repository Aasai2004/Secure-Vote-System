import { Router, type IRouter } from "express";
import { db, candidatesTable, votersTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.voteCount);
  const [voterCount] = await db.select({ count: count() }).from(votersTable);

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const totalVoters = voterCount?.count ?? 0;

  const candidateResults = candidates
    .map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      symbol: c.symbol,
      voteCount: c.voteCount,
      percentage: totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100 * 10) / 10 : 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  const winner = candidateResults.length > 0 ? candidateResults[0] : undefined;

  const response: any = {
    candidates: candidateResults,
    totalVotes,
    totalVoters,
  };

  if (winner) {
    response.winner = winner;
  }

  res.json(response);
});

export default router;
