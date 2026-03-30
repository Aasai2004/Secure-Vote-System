import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, UserPlus, Flag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { 
    voters, candidates, isLoadingVoters, isLoadingCandidates, 
    addVoter, isAddingVoter, deleteVoter,
    addCandidate, isAddingCandidate, deleteCandidate 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'voters' | 'candidates'>('voters');
  
  // Voter form state
  const [voterName, setVoterName] = useState("");
  const [voterAadhar, setVoterAadhar] = useState("");
  const [voterIsAdmin, setVoterIsAdmin] = useState(false);

  // Candidate form state
  const [candName, setCandName] = useState("");
  const [candParty, setCandParty] = useState("");
  const [candSymbol, setCandSymbol] = useState("");

  if (isAuthLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!user) return <Redirect to="/" />;
  if (!user.isAdmin) return <Redirect to="/vote" />;

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    addVoter({ data: { name: voterName, aadharNumber: voterAadhar, isAdmin: voterIsAdmin } });
    setVoterName("");
    setVoterAadhar("");
    setVoterIsAdmin(false);
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    addCandidate({ data: { name: candName, party: candParty, symbol: candSymbol } });
    setCandName("");
    setCandParty("");
    setCandSymbol("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage election entities and configurations</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('voters')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'voters' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-4 h-4" /> Voters
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'candidates' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Flag className="w-4 h-4" /> Candidates
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {activeTab === 'voters' ? (
              <motion.div key="voters-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
                    <UserPlus className="w-5 h-5 text-accent" /> Register Voter
                  </h2>
                  <form onSubmit={handleAddVoter} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={voterName} onChange={(e) => setVoterName(e.target.value)} required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Aadhar Number</Label>
                      <Input 
                        value={voterAadhar} 
                        onChange={(e) => setVoterAadhar(e.target.value.replace(/[^0-9]/g, ''))} 
                        maxLength={12} minLength={12} required 
                        placeholder="12 digit ID" 
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox id="is-admin" checked={voterIsAdmin} onCheckedChange={(c) => setVoterIsAdmin(!!c)} />
                      <Label htmlFor="is-admin" className="cursor-pointer">Grant Admin Access</Label>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isAddingVoter}>
                      {isAddingVoter ? "Registering..." : "Add Voter"}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="candidates-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
                    <Flag className="w-5 h-5 text-accent" /> Register Candidate
                  </h2>
                  <form onSubmit={handleAddCandidate} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Candidate Name</Label>
                      <Input value={candName} onChange={(e) => setCandName(e.target.value)} required placeholder="Jane Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label>Party Name</Label>
                      <Input value={candParty} onChange={(e) => setCandParty(e.target.value)} required placeholder="Democratic Party" />
                    </div>
                    <div className="space-y-2">
                      <Label>Symbol (Emoji or Text)</Label>
                      <Input value={candSymbol} onChange={(e) => setCandSymbol(e.target.value)} required placeholder="🦅" />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isAddingCandidate}>
                      {isAddingCandidate ? "Registering..." : "Add Candidate"}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              {activeTab === 'voters' ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Aadhar</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoadingVoters ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading voters...</td></tr>
                    ) : voters.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No voters found</td></tr>
                    ) : (
                      voters.map((v) => (
                        <tr key={v.id} className="hover:bg-muted/50 transition-colors bg-card">
                          <td className="px-6 py-4 font-medium flex items-center gap-2">
                            {v.name} {v.isAdmin && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Admin</span>}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-mono">XXXX-XXXX-{v.aadharNumber.slice(-4)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${v.hasVoted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {v.hasVoted ? 'Voted' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteVoter({ id: v.id })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Candidate</th>
                      <th className="px-6 py-4 font-semibold">Party</th>
                      <th className="px-6 py-4 font-semibold">Symbol</th>
                      <th className="px-6 py-4 font-semibold">Votes</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoadingCandidates ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading candidates...</td></tr>
                    ) : candidates.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No candidates found</td></tr>
                    ) : (
                      candidates.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/50 transition-colors bg-card">
                          <td className="px-6 py-4 font-medium">{c.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{c.party}</td>
                          <td className="px-6 py-4 text-2xl">{c.symbol}</td>
                          <td className="px-6 py-4 font-mono font-medium">{c.voteCount}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteCandidate({ id: c.id })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
