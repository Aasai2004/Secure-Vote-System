import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Fingerprint, ScanFace, CheckCircle2, Loader2, Camera, Vote, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "face" | "fingerprint" | "done";

function PulseRing() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.4s" }} />
      <div className="absolute inset-2 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.4s", animationDelay: "0.3s" }} />
    </div>
  );
}

export default function Verify() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("face");

  const [faceStatus, setFaceStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [faceProgress, setFaceProgress] = useState(0);

  const [fpStatus, setFpStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [fpProgress, setFpProgress] = useState(0);

  // Guard: must be logged in to reach this page
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  if (!user) return <Redirect to="/" />;

  const startFaceScan = () => {
    setFaceStatus("scanning");
    setFaceProgress(0);
    const iv = setInterval(() => {
      setFaceProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setFaceStatus("done");
          setTimeout(() => setStep("fingerprint"), 600);
          return 100;
        }
        return p + 4;
      });
    }, 70);
  };

  const startFpScan = () => {
    setFpStatus("scanning");
    setFpProgress(0);
    const iv = setInterval(() => {
      setFpProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setFpStatus("done");
          setTimeout(() => setStep("done"), 600);
          return 100;
        }
        return p + 3;
      });
    }, 80);
  };

  const handleProceed = () => {
    if (user.isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/vote");
    }
  };

  const stepIndex = step === "face" ? 0 : step === "fingerprint" ? 1 : 2;

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-md mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Aadhar Verified — Step 2 of 3
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Biometric Verification</h1>
          <p className="text-muted-foreground text-sm">Welcome, <span className="font-semibold text-foreground">{user.name}</span>. Complete both scans to proceed.</p>
        </motion.div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Face Scan", "Fingerprint", "Complete"].map((label, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`w-8 h-0.5 mb-4 ${i < stepIndex ? "bg-green-400" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        <Card className="p-8 shadow-xl shadow-primary/5 border-border/50">
          <AnimatePresence mode="wait">

            {/* ── Face Scan ── */}
            {step === "face" && (
              <motion.div
                key="face"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center"
              >
                <h2 className="text-lg font-bold mb-1">Face Recognition</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Look directly at the camera and hold still.
                </p>

                <div className="relative w-44 h-44 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-muted/60 flex items-center justify-center overflow-hidden">
                      <ScanFace className={`h-20 w-20 transition-colors duration-300 ${faceStatus === "done" ? "text-green-500" : faceStatus === "scanning" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
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
                  <div className="w-full mb-5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{faceStatus === "done" ? "✓ Face matched!" : "Scanning..."}</span>
                      <span>{faceProgress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-75 ${faceStatus === "done" ? "bg-green-500" : "bg-primary"}`} style={{ width: `${faceProgress}%` }} />
                    </div>
                  </div>
                )}

                {faceStatus === "idle" && (
                  <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25" onClick={startFaceScan}>
                    <Camera className="h-4 w-4 mr-2" /> Start Face Scan
                  </Button>
                )}
                {faceStatus === "scanning" && (
                  <Button disabled className="w-full h-12 text-base font-semibold rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Scanning Face...
                  </Button>
                )}
                {faceStatus === "done" && (
                  <div className="w-full p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium text-center">
                    ✓ Face verified — proceeding to fingerprint...
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Fingerprint ── */}
            {step === "fingerprint" && (
              <motion.div
                key="fp"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center"
              >
                <h2 className="text-lg font-bold mb-1">Fingerprint Scan</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Place your index finger on the scanner.
                </p>

                <div className="relative w-44 h-44 mb-6">
                  <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-primary/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-xl bg-muted/60 flex items-center justify-center">
                      <Fingerprint
                        className={`h-24 w-24 transition-colors duration-300 ${fpStatus === "done" ? "text-green-500" : fpStatus === "scanning" ? "text-primary" : "text-muted-foreground"}`}
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
                  <div className="w-full mb-5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{fpStatus === "done" ? "✓ Fingerprint matched!" : "Reading fingerprint..."}</span>
                      <span>{fpProgress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-75 ${fpStatus === "done" ? "bg-green-500" : "bg-primary"}`} style={{ width: `${fpProgress}%` }} />
                    </div>
                  </div>
                )}

                {fpStatus === "idle" && (
                  <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25" onClick={startFpScan}>
                    <Fingerprint className="h-4 w-4 mr-2" /> Scan Fingerprint
                  </Button>
                )}
                {fpStatus === "scanning" && (
                  <Button disabled className="w-full h-12 text-base font-semibold rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Reading Fingerprint...
                  </Button>
                )}
                {fpStatus === "done" && (
                  <div className="w-full p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium text-center">
                    ✓ Fingerprint verified — please wait...
                  </div>
                )}
              </motion.div>
            )}

            {/* ── All done ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </motion.div>

                <h2 className="text-xl font-bold text-green-700 mb-1">Identity Verified!</h2>
                <p className="text-sm text-muted-foreground mb-5">All three checks passed successfully.</p>

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
                  onClick={handleProceed}
                >
                  <Vote className="h-4 w-4 mr-2" />
                  {user.isAdmin ? "Go to Admin Panel" : "Proceed to Vote"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
