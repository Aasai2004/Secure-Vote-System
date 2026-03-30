import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Fingerprint,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  ScanFace,
  Vote,
  Loader2,
  AlertCircle,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "Aadhar", icon: ShieldAlert },
  { id: 2, label: "Face", icon: ScanFace },
  { id: 3, label: "Fingerprint", icon: Fingerprint },
  { id: 4, label: "Ready", icon: Vote },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={`text-xs font-medium ${
                  active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 mb-5 transition-all duration-500 ${
                  s.id < current ? "bg-green-400" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PulseRing() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.4s" }} />
      <div className="absolute inset-2 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.4s", animationDelay: "0.3s" }} />
    </div>
  );
}

export default function Login() {
  const [step, setStep] = useState<Step>(1);
  const [aadhar, setAadhar] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [faceStatus, setFaceStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [faceProgress, setFaceProgress] = useState(0);

  const [fpStatus, setFpStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [fpProgress, setFpProgress] = useState(0);

  // loggedInUser is captured at step-1 success and used only at step-4
  const [loggedInUser, setLoggedInUser] = useState<{ isAdmin: boolean; name: string } | null>(null);

  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  /* ── Step 1: verify Aadhar via API ── */
  const handleAadharSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhar.length !== 12) return;
    setLoginError(null);
    login(
      { data: { aadharNumber: aadhar, isAdmin } },
      {
        onSuccess: (data: any) => {
          // Save user info locally; do NOT redirect yet
          setLoggedInUser({ isAdmin: data.voter.isAdmin, name: data.voter.name });
          setStep(2);
        },
        onError: (err: any) => {
          setLoginError(
            err?.error || err?.message || "Aadhar number not registered. Please contact admin."
          );
        },
      }
    );
  };

  /* ── Step 2: simulated face scan ── */
  const startFaceScan = () => {
    setFaceStatus("scanning");
    setFaceProgress(0);
    const iv = setInterval(() => {
      setFaceProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setFaceStatus("done");
          setTimeout(() => setStep(3), 600);
          return 100;
        }
        return p + 4;
      });
    }, 80);
  };

  /* ── Step 3: simulated fingerprint ── */
  const startFpScan = () => {
    setFpStatus("scanning");
    setFpProgress(0);
    const iv = setInterval(() => {
      setFpProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setFpStatus("done");
          setTimeout(() => setStep(4), 600);
          return 100;
        }
        return p + 3;
      });
    }, 80);
  };

  /* ── Step 4: proceed ── */
  const handleGoVote = () => {
    setLocation(loggedInUser?.isAdmin ? "/admin" : "/vote");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

        {/* ── Left: form ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <ShieldAlert className="h-4 w-4" />
              Official Portal
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Secure Voting Gateway
            </h1>
            <p className="text-muted-foreground">
              Three-factor identity verification for a fair and secure election.
            </p>
          </div>

          <Card className="p-8 shadow-xl shadow-primary/5 border-border/50">
            <StepIndicator current={step} />

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Aadhar ── */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-lg font-semibold mb-1">Step 1: Aadhar Verification</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Enter your 12-digit Aadhar number to begin.
                  </p>
                  <form onSubmit={handleAadharSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="aadhar" className="font-semibold">Aadhar Number</Label>
                      <div className="relative">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          id="aadhar"
                          type="text"
                          pattern="[0-9]*"
                          maxLength={12}
                          placeholder="Enter 12-digit Aadhar number"
                          className="pl-12 h-13 text-lg bg-background border-border/50 focus:border-primary rounded-xl"
                          value={aadhar}
                          onChange={(e) => {
                            setLoginError(null);
                            setAadhar(e.target.value.replace(/[^0-9]/g, ""));
                          }}
                          required
                        />
                      </div>
                      {aadhar.length > 0 && aadhar.length < 12 && (
                        <p className="text-xs text-destructive font-medium">Must be exactly 12 digits</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                      <Checkbox
                        id="admin"
                        checked={isAdmin}
                        onCheckedChange={(c) => setIsAdmin(c as boolean)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor="admin" className="font-medium cursor-pointer text-sm">
                        Request Administrator Access
                      </Label>
                    </div>

                    {loginError && (
                      <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        {loginError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
                      disabled={aadhar.length !== 12 || isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Verify Aadhar <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2: Face scan ── */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center"
                >
                  <h2 className="text-lg font-semibold mb-1">Step 2: Face Verification</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Look directly at the camera and hold still while we scan your face.
                  </p>

                  <div className="relative w-48 h-48 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full bg-muted/60 flex items-center justify-center overflow-hidden">
                        <ScanFace
                          className={`h-20 w-20 transition-colors duration-300 ${
                            faceStatus === "done" ? "text-green-500"
                            : faceStatus === "scanning" ? "text-primary animate-pulse"
                            : "text-muted-foreground"
                          }`}
                        />
                      </div>
                    </div>
                    {faceStatus === "scanning" && <PulseRing />}
                    {faceStatus === "done" && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {faceStatus !== "idle" && (
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{faceStatus === "done" ? "Face matched!" : "Scanning..."}</span>
                        <span>{faceProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${faceStatus === "done" ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${faceProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {faceStatus === "idle" && (
                    <Button
                      className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25"
                      onClick={startFaceScan}
                    >
                      <span className="flex items-center gap-2">
                        <Camera className="h-4 w-4" /> Start Face Scan
                      </span>
                    </Button>
                  )}
                  {faceStatus === "scanning" && (
                    <Button disabled className="w-full h-12 text-base font-semibold rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Scanning Face...
                    </Button>
                  )}
                </motion.div>
              )}

              {/* ── STEP 3: Fingerprint ── */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center"
                >
                  <h2 className="text-lg font-semibold mb-1">Step 3: Fingerprint Scan</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Place your index finger on the scanner to verify your identity.
                  </p>

                  <div className="relative w-48 h-48 mb-6">
                    <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-primary/30 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-xl bg-muted/60 flex items-center justify-center">
                        <Fingerprint
                          className={`h-24 w-24 transition-colors duration-300 ${
                            fpStatus === "done" ? "text-green-500"
                            : fpStatus === "scanning" ? "text-primary"
                            : "text-muted-foreground"
                          }`}
                          style={fpStatus === "scanning" ? { filter: `drop-shadow(0 0 ${fpProgress / 10}px hsl(var(--primary)))` } : {}}
                        />
                      </div>
                    </div>
                    {fpStatus === "scanning" && <PulseRing />}
                    {fpStatus === "done" && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {fpStatus !== "idle" && (
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{fpStatus === "done" ? "Fingerprint matched!" : "Reading fingerprint..."}</span>
                        <span>{fpProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${fpStatus === "done" ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${fpProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {fpStatus === "idle" && (
                    <Button
                      className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25"
                      onClick={startFpScan}
                    >
                      <span className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4" /> Scan Fingerprint
                      </span>
                    </Button>
                  )}
                  {fpStatus === "scanning" && (
                    <Button disabled className="w-full h-12 text-base font-semibold rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Reading Fingerprint...
                    </Button>
                  )}
                </motion.div>
              )}

              {/* ── STEP 4: All done ── */}
              {step === 4 && (
                <motion.div
                  key="s4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5"
                  >
                    <CheckCircle2 className="h-14 w-14 text-green-500" />
                  </motion.div>

                  <h2 className="text-xl font-bold text-green-700 mb-1">Identity Verified!</h2>
                  <p className="text-sm text-muted-foreground mb-1">All checks passed successfully.</p>
                  {loggedInUser && (
                    <p className="text-sm font-semibold text-foreground mb-6">Welcome, {loggedInUser.name}</p>
                  )}

                  <div className="w-full space-y-2 mb-6 text-left">
                    {["Aadhar Verification", "Face Recognition", "Fingerprint Scan"].map((label) => (
                      <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50 border border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-sm font-medium text-green-800">{label}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 shadow-lg shadow-green-500/25"
                    onClick={handleGoVote}
                  >
                    <span className="flex items-center gap-2">
                      <Vote className="h-4 w-4" />
                      {loggedInUser?.isAdmin ? "Go to Admin Panel" : "Proceed to Vote"}
                    </span>
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ── Right: hero image ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden lg:block relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10 rounded-3xl" />
          <img
            src={`${import.meta.env.BASE_URL}images/civic-hero.png`}
            alt="Civic Voting"
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent z-20" />
          <div className="absolute bottom-8 left-8 right-8 z-30 text-white">
            <h3 className="text-2xl font-serif font-bold mb-2">Every Vote Counts</h3>
            <p className="text-white/80">
              Three-factor biometric verification ensures only registered voters can cast a ballot.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
