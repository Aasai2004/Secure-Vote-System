import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useVoting } from "@/hooks/use-voting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Flag, Vote as VoteIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Vote() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { candidates, isLoadingCandidates, castVote, isVoting } = useVoting();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  if (isAuthLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
  if (!user) return <Redirect to="/" />;
  if (user.isAdmin) return <Redirect to="/admin" />;

  // Already voted → go to success page
  if (user.hasVoted) return <Redirect to="/success" />;

  const handleVote = () => {
    if (!selectedCandidate) return;
    castVote(
      { data: { candidateId: selectedCandidate } },
      {
        onSuccess: () => {
          setLocation("/success");
        },
      }
    );
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          <VoteIcon className="h-4 w-4" />
          Official Ballot
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight">Cast Your Vote</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome, <span className="font-semibold text-foreground">{user.name}</span>.
          Select your preferred candidate below. This action cannot be undone.
        </p>
      </div>

      {/* Candidate cards */}
      {isLoadingCandidates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, idx) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col p-6 overflow-hidden relative group hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Flag className="w-24 h-24 text-primary" />
                </div>
                <div className="flex-1 z-10 relative">
                  <div className="text-5xl mb-4">{candidate.symbol}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{candidate.name}</h3>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {candidate.party}
                  </p>
                </div>
                <div className="mt-8 z-10 relative">
                  <Button
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className="w-full h-12 text-base font-semibold border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white transition-all rounded-xl"
                  >
                    <VoteIcon className="h-4 w-4 mr-2" /> Select Candidate
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          {candidates.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No candidates have been registered for this election yet.
            </div>
          )}
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={selectedCandidate !== null} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Confirm Your Vote</DialogTitle>
            <DialogDescription className="text-base py-4">
              You are about to cast your vote for{" "}
              <strong className="text-foreground">
                {candidates.find((c) => c.id === selectedCandidate)?.name}
              </strong>{" "}
              ({candidates.find((c) => c.id === selectedCandidate)?.party}).
              <br /><br />
              This action is <strong>final</strong> and cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setSelectedCandidate(null)} disabled={isVoting} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleVote}
              disabled={isVoting}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 text-white gap-2 h-11 font-semibold rounded-xl"
            >
              {isVoting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Casting Vote...</>
                : <><VoteIcon className="w-4 h-4" /> Confirm &amp; Cast Vote</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
