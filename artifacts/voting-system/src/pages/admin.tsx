import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, UserPlus, Flag, Trash2, Fingerprint, ScanFace,
  CheckCircle2, ArrowRight, Loader2, Camera, ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Shared biometric sub-components ─── */

function PulseRing() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.4s" }} />
      <div className="absolute inset-2 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.4s", animationDelay: "0.3s" }} />
    </div>
  );
}

interface ScanStepProps {
  type: "face" | "fingerprint";
  status: "idle" | "scanning" | "done";
  progress: number;
  onStart: () => void;
}

function ScanStep({ type, status, progress, onStart }: ScanStepProps) {
  const isFace = type === "face";
  return (
    <div className="flex flex-col items-center text-center py-2">
      <div className="relative w-40 h-40 mb-5">
        <div className={`absolute inset-0 ${isFace ? "rounded-full" : "rounded-2xl"} border-4 border-dashed border-primary/30 flex items-center justify-center`}>
          <div className={`w-28 h-28 ${isFace ? "rounded-full" : "rounded-xl"} bg-muted/60 flex items-center justify-center overflow-hidden`}>
            {isFace ? (
              <ScanFace className={`h-16 w-16 transition-colors duration-300 ${status === "done" ? "text-green-500" : status === "scanning" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            ) : (
              <Fingerprint
                className={`h-20 w-20 transition-colors duration-300 ${status === "done" ? "text-green-500" : status === "scanning" ? "text-primary" : "text-muted-foreground"}`}
                style={status === "scanning" ? { filter: `drop-shadow(0 0 ${progress / 10}px hsl(var(--primary)))` } : {}}
              />
            )}
          </div>
        </div>
        {status === "scanning" && <PulseRing />}
        {status === "done" && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {status !== "idle" && (
        <div className="w-full mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{status === "done" ? (isFace ? "Face captured!" : "Fingerprint captured!") : (isFace ? "Scanning face..." : "Reading fingerprint...")}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${status === "done" ? "bg-green-500" : "bg-primary"}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === "idle" && (
        <Button className="w-full h-11 font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-md shadow-primary/25" onClick={onStart}>
          <span className="flex items-center gap-2">
            {isFace ? <Camera className="h-4 w-4" /> : <Fingerprint className="h-4 w-4" />}
            {isFace ? "Start Face Scan" : "Scan Fingerprint"}
          </span>
        </Button>
      )}
      {status === "scanning" && (
        <Button disabled className="w-full h-11 font-semibold rounded-xl">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {isFace ? "Scanning Face..." : "Reading Fingerprint..."}
        </Button>
      )}
    </div>
  );
}

/* ─── Add-Voter multi-step form ─── */

type VoterStep = 1 | 2 | 3;

interface AddVoterFormProps {
  onAdd: (data: { name: string; aadharNumber: string; isAdmin?: boolean }) => void;
  isAdding: boolean;
}

function AddVoterForm({ onAdd, isAdding }: AddVoterFormProps) {
  const [voterStep, setVoterStep] = useState<VoterStep>(1);
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [grantAdmin, setGrantAdmin] = useState(false);

  const [faceStatus, setFaceStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [faceProgress, setFaceProgress] = useState(0);
  const [fpStatus, setFpStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [fpProgress, setFpProgress] = useState(0);

  const reset = () => {
    setVoterStep(1);
    setName("");
    setAadhar("");
    setGrantAdmin(false);
    setFaceStatus("idle");
    setFaceProgress(0);
    setFpStatus("idle");
    setFpProgress(0);
  };

  const startFace = () => {
    setFaceStatus("scanning");
    setFaceProgress(0);
    const iv = setInterval(() => {
      setFaceProgress((p) => {
        if (p >= 100) { clearInterval(iv); setFaceStatus("done"); setTimeout(() => setVoterStep(3), 500); return 100; }
        return p + 5;
      });
    }, 70);
  };

  const startFp = () => {
    setFpStatus("scanning");
    setFpProgress(0);
    const iv = setInterval(() => {
      setFpProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setFpStatus("done");
          return 100;
        }
        return p + 4;
      });
    }, 70);
  };

  const handleSubmit = () => {
    onAdd({ name, aadharNumber: aadhar, isAdmin: grantAdmin });
    reset();
  };

  const VOTER_STEPS = [
    { id: 1, label: "Details" },
    { id: 2, label: "Face" },
    { id: 3, label: "Fingerprint" },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b pb-4">
        <UserPlus className="w-5 h-5 text-accent" /> Register Voter
      </h2>

      {/* Mini step indicator */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {VOTER_STEPS.map((s, i) => {
          const done = s.id < voterStep;
          const active = s.id === voterStep;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < VOTER_STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 mb-3 ${s.id < voterStep ? "bg-green-400" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* Step 1: Name + Aadhar */}
        {voterStep === 1 && (
          <motion.div key="vs1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ravi Kumar" required />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">Aadhar Number</Label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-9"
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={12}
                  placeholder="12-digit Aadhar number"
                />
              </div>
              {aadhar.length > 0 && aadhar.length < 12 && (
                <p className="text-xs text-destructive">Must be exactly 12 digits</p>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="ga" checked={grantAdmin} onCheckedChange={(c) => setGrantAdmin(!!c)} />
              <Label htmlFor="ga" className="cursor-pointer text-sm">Grant Admin Access</Label>
            </div>
            <Button
              className="w-full mt-2 bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90"
              disabled={!name.trim() || aadhar.length !== 12}
              onClick={() => setVoterStep(2)}
            >
              <span className="flex items-center gap-2">Next: Face Scan <ArrowRight className="h-4 w-4" /></span>
            </Button>
          </motion.div>
        )}

        {/* Step 2: Face scan */}
        {voterStep === 2 && (
          <motion.div key="vs2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Capture voter's face for biometric registration.
            </p>
            <ScanStep type="face" status={faceStatus} progress={faceProgress} onStart={startFace} />
            {faceStatus === "idle" && (
              <button onClick={() => setVoterStep(1)} className="mt-3 text-xs text-muted-foreground flex items-center gap-1 mx-auto hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            )}
          </motion.div>
        )}

        {/* Step 3: Fingerprint + submit */}
        {voterStep === 3 && (
          <motion.div key="vs3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Capture voter's fingerprint to complete registration.
            </p>
            <ScanStep type="fingerprint" status={fpStatus} progress={fpProgress} onStart={startFp} />

            {fpStatus === "done" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> All biometrics captured</p>
                  <p className="text-xs text-green-700">Name: {name}</p>
                  <p className="text-xs text-green-700">Aadhar: ••••••••{aadhar.slice(-4)}</p>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 shadow-md"
                  onClick={handleSubmit}
                  disabled={isAdding}
                >
                  {isAdding ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registering...</> : "Register Voter"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </Card>
  );
}

/* ─── Main Admin Page ─── */

export default function Admin() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    voters, candidates, isLoadingVoters, isLoadingCandidates,
    addVoter, isAddingVoter, deleteVoter,
    addCandidate, isAddingCandidate, deleteCandidate,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"voters" | "candidates">("voters");

  // Candidate form state
  const [candName, setCandName] = useState("");
  const [candParty, setCandParty] = useState("");
  const [candSymbol, setCandSymbol] = useState("");

  if (isAuthLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!user) return <Redirect to="/" />;
  if (!user.isAdmin) return <Redirect to="/vote" />;

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    addCandidate({ data: { name: candName, party: candParty, symbol: candSymbol } });
    setCandName(""); setCandParty(""); setCandSymbol("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage election entities and configurations</p>
      </div>

      {/* Tab switcher */}
      <div className="flex space-x-1 bg-muted p-1 rounded-xl w-fit">
        {(["voters", "candidates"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 capitalize ${activeTab === tab ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab === "voters" ? <Users className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left: form */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {activeTab === "voters" ? (
              <motion.div key="vf" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <AddVoterForm
                  onAdd={(data) => addVoter({ data })}
                  isAdding={isAddingVoter}
                />
              </motion.div>
            ) : (
              <motion.div key="cf" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
                    <Flag className="w-5 h-5 text-accent" /> Register Candidate
                  </h2>
                  <form onSubmit={handleAddCandidate} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Candidate Name</Label>
                      <Input value={candName} onChange={(e) => setCandName(e.target.value)} required placeholder="Jane Smith" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Party Name</Label>
                      <Input value={candParty} onChange={(e) => setCandParty(e.target.value)} required placeholder="Democratic Party" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Symbol (Emoji or Text)</Label>
                      <Input value={candSymbol} onChange={(e) => setCandSymbol(e.target.value)} required placeholder="🦅" />
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90" disabled={isAddingCandidate}>
                      {isAddingCandidate ? "Registering..." : "Add Candidate"}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: list */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              {activeTab === "voters" ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Aadhar</th>
                      <th className="px-6 py-4 font-semibold">Biometrics</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoadingVoters ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading voters...</td></tr>
                    ) : voters.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No voters registered yet</td></tr>
                    ) : voters.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/50 transition-colors bg-card">
                        <td className="px-6 py-4 font-medium">
                          <span className="flex items-center gap-2">
                            {v.name}
                            {v.isAdmin && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Admin</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono">••••••••{v.aadharNumber.slice(-4)}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-green-600 text-xs font-medium">
                            <ScanFace className="h-3.5 w-3.5" /> Face
                            <Fingerprint className="h-3.5 w-3.5 ml-1" /> Print
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${v.hasVoted ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {v.hasVoted ? "Voted" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteVoter({ id: v.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                    ) : candidates.map((c) => (
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
                    ))}
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
