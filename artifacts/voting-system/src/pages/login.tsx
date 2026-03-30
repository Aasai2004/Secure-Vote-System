import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Fingerprint, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [aadhar, setAadhar] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation(user.isAdmin ? "/admin" : "/vote");
    }
  }, [user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhar.length !== 12) return;
    login({ data: { aadharNumber: aadhar, isAdmin } });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <ShieldAlert className="h-4 w-4" />
              Official Portal
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
              Secure Voting Gateway
            </h1>
            <p className="text-muted-foreground text-lg">
              Verify your identity to participate in the upcoming election. Your vote is encrypted and anonymous.
            </p>
          </div>

          <Card className="p-8 shadow-xl shadow-primary/5 border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="aadhar" className="text-base font-semibold">
                  Aadhar Number
                </Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="aadhar"
                    type="text"
                    pattern="[0-9]*"
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhar number"
                    className="pl-12 h-14 text-lg bg-background border-border/50 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    value={aadhar}
                    onChange={(e) => setAadhar(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
                {aadhar.length > 0 && aadhar.length < 12 && (
                  <p className="text-sm text-destructive font-medium">Must be exactly 12 digits</p>
                )}
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                <Checkbox 
                  id="admin" 
                  checked={isAdmin} 
                  onCheckedChange={(c) => setIsAdmin(c as boolean)} 
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="admin" className="font-medium cursor-pointer">
                  Request Administrator Access
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                disabled={aadhar.length !== 12 || isLoggingIn}
              >
                {isLoggingIn ? "Verifying..." : (
                  <span className="flex items-center gap-2">
                    Verify Identity <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Right Side: Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden lg:block relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10 rounded-3xl"></div>
          <img 
            src={`${import.meta.env.BASE_URL}images/civic-hero.png`}
            alt="Civic Voting Background"
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          />
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent z-20"></div>
          
          <div className="absolute bottom-8 left-8 right-8 z-30 text-white">
            <h3 className="text-2xl font-serif font-bold mb-2">Every Vote Counts</h3>
            <p className="text-white/80">
              Participate in shaping the future. Our verifiable digital system ensures your voice is heard securely.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
