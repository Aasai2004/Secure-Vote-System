import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BarChart3, LogOut, Vote, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Success() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-lg text-center">

        {/* Big animated check */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Vote Cast Successfully!
          </h1>
          {user && (
            <p className="text-lg text-muted-foreground mb-2">
              Thank you, <span className="font-semibold text-foreground">{user.name}</span>.
            </p>
          )}
          <p className="text-muted-foreground mb-8">
            Your vote has been securely recorded and encrypted in the system.
          </p>
        </motion.div>

        {/* Steps summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-card border border-border/60 rounded-2xl p-6 mb-8 text-left shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Verification Summary</p>
          <div className="space-y-3">
            {[
              { icon: Shield, label: "Aadhar Verification", status: "Verified" },
              { icon: Vote, label: "Face Recognition", status: "Confirmed" },
              { icon: Shield, label: "Fingerprint Scan", status: "Confirmed" },
              { icon: CheckCircle2, label: "Vote Recorded", status: "Complete" },
            ].map(({ icon: Icon, label, status }, i) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-900">{label}</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            className="h-12 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[#0f3b75] hover:opacity-90 shadow-lg shadow-primary/25"
            onClick={() => setLocation("/results")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Live Results
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 text-base font-semibold rounded-xl border-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout Securely
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground mt-6"
        >
          Your ballot is anonymous and cannot be traced back to you.
        </motion.p>

      </div>
    </div>
  );
}
