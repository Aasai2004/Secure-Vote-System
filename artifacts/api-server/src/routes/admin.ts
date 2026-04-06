import { Router, type IRouter } from "express";
import { db, votersTable, candidatesTable, votesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddVoterBody, AddCandidateBody, DeleteVoterParams, DeleteCandidateParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const voterId = req.session?.voterId;
  if (!voterId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  const voter = await db.query.votersTable.findFirst({
    where: eq(votersTable.id, voterId),
  });
  if (!voter || !voter.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

router.get("/voters", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const voters = await db.select().from(votersTable).orderBy(votersTable.createdAt);
  res.json(voters.map(v => ({
    id: v.id,
    name: v.name,
    aadharNumber: v.aadharNumber,
    hasVoted: v.hasVoted,
    isAdmin: v.isAdmin,
    hasFaceData: !!v.faceDescriptor,
    createdAt: v.createdAt.toISOString(),
  })));
});

router.post("/voters", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const parsed = AddVoterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name, aadharNumber, isAdmin, faceDescriptor } = parsed.data;

  const existing = await db.query.votersTable.findFirst({
    where: eq(votersTable.aadharNumber, aadharNumber),
  });

  if (existing) {
    res.status(400).json({ error: "Voter with this Aadhar number already exists" });
    return;
  }

  const [newVoter] = await db.insert(votersTable).values({
    name,
    aadharNumber,
    isAdmin: isAdmin ?? false,
    faceDescriptor: faceDescriptor ?? null,
  }).returning();

  res.status(201).json({
    id: newVoter.id,
    name: newVoter.name,
    aadharNumber: newVoter.aadharNumber,
    hasVoted: newVoter.hasVoted,
    isAdmin: newVoter.isAdmin,
    createdAt: newVoter.createdAt.toISOString(),
  });
});

router.delete("/voters/:id", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const parsed = DeleteVoterParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid voter ID" });
    return;
  }

  await db.delete(votersTable).where(eq(votersTable.id, parsed.data.id));
  res.json({ message: "Voter deleted successfully" });
});

router.get("/candidates", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.createdAt);
  res.json(candidates.map(c => ({
    id: c.id,
    name: c.name,
    party: c.party,
    symbol: c.symbol,
    voteCount: c.voteCount,
  })));
});

router.post("/candidates", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const parsed = AddCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name, party, symbol } = parsed.data;

  const [newCandidate] = await db.insert(candidatesTable).values({
    name,
    party,
    symbol,
  }).returning();

  res.status(201).json({
    id: newCandidate.id,
    name: newCandidate.name,
    party: newCandidate.party,
    symbol: newCandidate.symbol,
    voteCount: newCandidate.voteCount,
  });
});

router.delete("/candidates/:id", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const parsed = DeleteCandidateParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid candidate ID" });
    return;
  }

  await db.delete(candidatesTable).where(eq(candidatesTable.id, parsed.data.id));
  res.json({ message: "Candidate deleted successfully" });
});

router.get("/vote-details", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const voteRecords = await db
    .select({
      voteId: votesTable.id,
      voterId: votersTable.id,
      voterName: votersTable.name,
      voterAadhar: votersTable.aadharNumber,
      candidateId: candidatesTable.id,
      candidateName: candidatesTable.name,
      candidateParty: candidatesTable.party,
      candidateSymbol: candidatesTable.symbol,
      votedAt: votesTable.votedAt,
    })
    .from(votesTable)
    .innerJoin(votersTable, eq(votesTable.voterId, votersTable.id))
    .innerJoin(candidatesTable, eq(votesTable.candidateId, candidatesTable.id))
    .orderBy(votesTable.votedAt);

  res.json(
    voteRecords.map((r) => ({
      voteId: r.voteId,
      voterId: r.voterId,
      voterName: r.voterName,
      voterAadhar: r.voterAadhar,
      candidateId: r.candidateId,
      candidateName: r.candidateName,
      candidateParty: r.candidateParty,
      candidateSymbol: r.candidateSymbol,
      votedAt: r.votedAt.toISOString(),
    }))
  );
});

export default router;
