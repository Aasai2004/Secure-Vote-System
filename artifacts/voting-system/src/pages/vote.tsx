import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useVoting } from "@/hooks/use-voting";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Vote as VoteIcon, Loader2, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CARD_COLORS = [
  { bg: "from-blue-600 to-blue-800", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", btn: "bg-blue-600 hover:bg-blue-700" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", btn: "bg-amber-500 hover:bg-amber-600" },
  { bg: "from-emerald-500 to-green-700", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", btn: "bg-emerald-500 hover:bg-emerald-600" },
  { bg: "from-purple-600 to-violet-700", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", btn: "bg-purple-600 hover:bg-purple-700" },
  { bg: "from-rose-500 to-red-700", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", btn: "bg-rose-500 hover:bg-rose-600" },
];

export default function Vote() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { candidates, isLoadingCandidates, castVote, isVoting } = useVoting();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  if (isAuthLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
  if (!user) return <Redirect to="/" />;
  if (user.hasVoted) return <Redirect to="/success" />;

  const selectedCandidate = candidates.find(c => c.id === selectedId);

  const handleVote = () => {
    if (!selectedId) return;
    castVote(
      { data: { candidateId: selectedId } },
      { onSuccess: () => setLocation("/success") }
    );
    setSelectedId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
          <VoteIcon className="h-4 w-4" />
          Official Ballot — Cast Your Vote
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight">Select a Candidate</h1>

        {/* Voter info bar */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Identity verified — Welcome, <span className="font-bold">{user.name}</span>
          <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
        </div>
      </motion.div>

      {/* Candidate grid */}
      {isLoadingCandidates ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <User className="h-12 w-12 opacity-30" />
          <p className="text-lg">No candidates have been registered yet.</p>
          <p className="text-sm">Please contact the election administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, idx) => {
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            const isHovered = hoveredId === candidate.id;
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                onMouseEnter={() => setHoveredId(candidate.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/30"
                style={{ transform: isHovered ? 'translateY(-4px)' : 'none' }}
              >
                {/* Colored top band with symbol */}
                <div className={`bg-gradient-to-br ${color.bg} flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 right-2 text-8xl">{candidate.symbol}</div>
                  </div>
                  <div className="text-6xl mb-2 relative z-10 drop-shadow-lg">{candidate.symbol}</div>
                  <div className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Candidate #{idx + 1}</div>
                </div>

                {/* Candidate info */}
                <div className="bg-white flex-1 p-5 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{candidate.name}</h3>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${color.light} ${color.border} border w-fit mb-4`}>
                    <span className={`text-xs font-bold ${color.text}`}>{candidate.party}</span>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => setSelectedId(candidate.id)}
                      className={`w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${color.btn} shadow-sm active:scale-95`}
                    >
                      <VoteIcon className="h-4 w-4" />
                      Vote for {candidate.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Instruction footer */}
      {candidates.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground"
        >
          Click on a candidate to review your choice before confirming. Your vote is final and cannot be changed.
        </motion.p>
      )}

      {/* Confirmation dialog */}
      <AnimatePresence>
        {selectedId !== null && selectedCandidate && (
          <Dialog open onOpenChange={(open) => !open && setSelectedId(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-center">Confirm Your Vote</DialogTitle>
              </DialogHeader>

              <div className="py-4">
                {/* Candidate preview in dialog */}
                <div className="flex flex-col items-center text-center bg-muted/30 rounded-2xl p-6 mb-4 border border-border/50">
                  <div className="text-6xl mb-3">{selectedCandidate.symbol}</div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedCandidate.name}</h3>
                  <p className="text-muted-foreground font-medium mt-1">{selectedCandidate.party}</p>
                </div>

                <DialogDescription className="text-center text-sm text-muted-foreground">
                  You are about to cast your vote for <strong className="text-foreground">{selectedCandidate.name}</strong>.
                  This action is <strong>final</strong> and cannot be reversed.
                </DialogDescription>
              </div>

              <DialogFooter className="gap-3 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setSelectedId(null)}
                  disabled={isVoting}
                  className="w-full sm:w-auto h-11 rounded-xl font-semibold"
                >
                  Change Selection
                </Button>
                <Button
                  onClick={handleVote}
                  disabled={isVoting}
                  className="w-full sm:w-auto h-11 rounded-xl font-bold bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 text-white"
                >
                  {isVoting
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Casting Vote...</>
                    : <><CheckCircle2 className="w-4 h-4 mr-2" />Confirm &amp; Submit Vote</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

    </div>
  );
}
