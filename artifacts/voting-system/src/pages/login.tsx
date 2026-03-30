import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Fingerprint, ShieldAlert, ArrowRight, Loader2, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [aadhar, setAadhar] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhar.length !== 12) return;
    setLoginError(null);

    login(
      { data: { aadharNumber: aadhar, isAdmin: false } },
      {
        onSuccess: (data: any) => {
          const voter = data.voter;
          // Store voter info in sessionStorage so verify page can use it
          sessionStorage.setItem("pendingVerify", JSON.stringify({
            isAdmin: voter.isAdmin,
            name: voter.name,
          }));
          setLocation("/verify");
        },
        onError: (err: any) => {
          setLoginError(
            err?.error || err?.message || "Aadhar number not registered. Please contact admin."
          );
        },
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <ShieldAlert className="h-4 w-4" />
              Official Voter Portal
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Voter Login
            </h1>
            <p className="text-muted-foreground">
              Enter your 12-digit Aadhar number to begin the verification process.
            </p>
          </div>

          <Card className="p-8 shadow-xl shadow-primary/5 border-border/50">
            {/* Step progress dots */}
            <div className="flex items-center gap-2 mb-7">
              {[{ label: "Aadhar", active: true }, { label: "Biometrics", active: false }, { label: "Vote", active: false }].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5`}>
                    <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${s.active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${s.active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                  {i < 2 && <div className="w-6 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="aadhar" className="font-semibold text-sm">Aadhar Number</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="aadhar"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhar number"
                    className="pl-12 h-12 text-base bg-background border-border/50 focus:border-primary rounded-xl"
                    value={aadhar}
                    onChange={(e) => {
                      setLoginError(null);
                      setAadhar(e.target.value.replace(/[^0-9]/g, ""));
                    }}
                    required
                  />
                </div>
                {aadhar.length > 0 && aadhar.length < 12 && (
                  <p className="text-xs text-destructive font-medium">{aadhar.length}/12 digits entered</p>
                )}
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Aadhar...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify Aadhar <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-1">
                After verification, you will proceed to biometric confirmation.
              </p>
            </form>
          </Card>
        </motion.div>

        {/* Right: hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden lg:block relative h-[520px] w-full rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-[#0f3b75] z-0" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-10 text-white text-center">
            <ShieldAlert className="h-16 w-16 text-white/80 mb-6" />
            <h3 className="text-3xl font-serif font-bold mb-3">Secure Digital Voting</h3>
            <p className="text-white/75 mb-8 max-w-xs">
              Three-factor biometric verification ensures only registered voters can cast a ballot.
            </p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
              {["Aadhar Verified", "Face Scanned", "Fingerprint Read"].map((s) => (
                <div key={s} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                  <p className="text-xs font-semibold text-white/90">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
