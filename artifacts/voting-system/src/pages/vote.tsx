import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useVoting } from "@/hooks/use-voting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Flag, Vote as VoteIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Vote() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { candidates, isLoadingCandidates, castVote, isVoting } = useVoting();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  if (isAuthLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!user) return <Redirect to="/" />;
  if (user.isAdmin) return <Redirect to="/admin" />;

  const handleVote = () => {
    if (selectedCandidate) {
      castVote({ data: { candidateId: selectedCandidate } });
      setSelectedCandidate(null);
    }
  };

  if (user.hasVoted) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="p-12 text-center shadow-xl border-border bg-gradient-to-b from-card to-secondary/30">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Thank You for Voting!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your vote has been securely recorded and encrypted in the system. 
            You may now view the live results or log out securely.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <a href="/results">View Live Results</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-serif font-bold tracking-tight">Official Ballot</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome, <span className="font-semibold text-foreground">{user.name}</span>. 
          Please select your preferred candidate below. Review carefully, as this action cannot be undone.
        </p>
      </div>

      {isLoadingCandidates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse"></div>
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
              <Card className="h-full flex flex-col p-6 overflow-hidden relative group hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Flag className="w-24 h-24 text-primary" />
                </div>
                
                <div className="flex-1 z-10 relative">
                  <div className="text-4xl mb-4">{candidate.symbol}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{candidate.name}</h3>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    {candidate.party}
                  </p>
                </div>

                <div className="mt-8 z-10 relative">
                  <Button 
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className="w-full h-12 text-base font-semibold bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    Select Candidate
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

      <Dialog open={selectedCandidate !== null} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Confirm Your Vote</DialogTitle>
            <DialogDescription className="text-base py-4">
              Are you sure you want to cast your vote for 
              <strong className="text-foreground ml-1">
                {candidates.find(c => c.id === selectedCandidate)?.name}
              </strong>?
              <br /><br />
              This action is final and cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedCandidate(null)} disabled={isVoting}>
              Cancel
            </Button>
            <Button 
              onClick={handleVote} 
              disabled={isVoting}
              className="bg-primary hover:bg-[#0f3b75] text-white gap-2"
            >
              {isVoting ? "Casting..." : <><VoteIcon className="w-4 h-4" /> Confirm & Cast Vote</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
