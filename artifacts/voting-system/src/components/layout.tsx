import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Landmark, LogOut, BarChart3, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-primary-foreground shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href={user ? (user.isAdmin ? "/admin" : "/vote") : "/"} className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Landmark className="h-6 w-6 text-accent" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">CivicVote</span>
            </Link>

            {/* Right side nav */}
            <div className="flex items-center gap-1 sm:gap-3">

              {/* Live Results — always visible */}
              <Link
                href="/results"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 ${location === "/results" ? "bg-white/15 text-white" : "text-white/80 hover:text-white"}`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Live Results</span>
              </Link>

              {/* Admin — always visible in ribbon */}
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 ${location === "/admin" ? "bg-white/15 text-white" : "text-white/80 hover:text-white"}`}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>

              {/* Divider + user info + logout when logged in */}
              {user && (
                <>
                  <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-2 text-sm text-white/90">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span className="font-medium">{user.name}</span>
                    {user.isAdmin && (
                      <span className="bg-accent/20 text-accent text-xs px-2 py-0.5 rounded-full font-bold border border-accent/20">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    className="text-white/80 hover:text-white hover:bg-white/10 ml-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Logout</span>
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      <footer className="py-6 border-t border-border bg-card text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} CivicVote Digital Voting System. Secure &amp; Verified.</p>
      </footer>
    </div>
  );
}
