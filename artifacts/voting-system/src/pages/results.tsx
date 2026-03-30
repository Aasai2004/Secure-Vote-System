import { useVoting } from "@/hooks/use-voting";
import { Card } from "@/components/ui/card";
import { Crown, TrendingUp, Users } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { motion } from "framer-motion";

export default function Results() {
  const { results, isLoadingResults } = useVoting();

  if (isLoadingResults || !results) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Predefined colors for charts (matching our civic theme)
  const chartColors = ['#0c2340', '#d4af37', '#1a5f7a', '#228b22', '#c0392b'];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold mb-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-600"></span> LIVE
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight">Election Results</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time tabulation of verified votes. Data is automatically refreshed as new votes are cast.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 flex items-center gap-6 border-l-4 border-l-primary shadow-md">
            <div className="bg-primary/10 p-4 rounded-full">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Votes</p>
              <p className="text-4xl font-mono font-bold text-foreground">{results.totalVotes}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 flex items-center gap-6 border-l-4 border-l-accent shadow-md">
            <div className="bg-accent/10 p-4 rounded-full">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Registered Voters</p>
              <p className="text-4xl font-mono font-bold text-foreground">{results.totalVoters}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 flex items-center gap-6 border-l-4 border-l-green-500 shadow-md">
            <div className="bg-green-100 p-4 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Turnout</p>
              <p className="text-4xl font-mono font-bold text-foreground">
                {results.totalVoters > 0 ? Math.round((results.totalVotes / results.totalVoters) * 100) : 0}%
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Winner Highlight */}
        <div className="lg:col-span-1">
          <Card className="p-8 h-full bg-gradient-to-b from-[#0c2340] to-[#1a4073] text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown className="w-48 h-48" />
            </div>
            
            <h3 className="text-xl font-bold text-accent mb-8 flex items-center gap-2">
              <Crown className="w-6 h-6" /> Current Leader
            </h3>
            
            {results.winner ? (
              <div className="relative z-10">
                <div className="text-6xl mb-6">{results.winner.symbol}</div>
                <h2 className="text-4xl font-serif font-bold mb-2">{results.winner.name}</h2>
                <p className="text-xl text-white/80 font-medium mb-8">{results.winner.party}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-white/90">
                    <span>VOTES SECURED</span>
                    <span>SHARE</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-mono font-bold text-accent">{results.winner.voteCount}</span>
                    <span className="text-2xl font-mono font-bold">{results.winner.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-white/60 text-lg">
                No votes cast yet
              </div>
            )}
          </Card>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full shadow-md border-border/50">
            <h3 className="text-xl font-bold mb-6 font-serif">Vote Distribution</h3>
            {results.candidates.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.candidates} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value} Votes`, 'Count']}
                    />
                    <Bar 
                      dataKey="voteCount" 
                      radius={[6, 6, 0, 0]}
                      animationDuration={1500}
                    >
                      {results.candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground bg-muted/30 rounded-xl">
                Insufficient data to display chart
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Detailed Table */}
      <Card className="overflow-hidden border-border/50 shadow-sm mt-8">
        <div className="p-6 border-b border-border/50 bg-muted/20">
          <h3 className="text-xl font-bold font-serif">Detailed Tabulation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Party</th>
                <th className="px-6 py-4 font-semibold text-right">Votes</th>
                <th className="px-6 py-4 font-semibold text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {results.candidates.sort((a,b) => b.voteCount - a.voteCount).map((c, i) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-base flex items-center gap-3">
                    <span className="text-2xl">{c.symbol}</span>
                    {c.name}
                    {i === 0 && results.totalVotes > 0 && <Crown className="w-4 h-4 text-accent ml-2" />}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{c.party}</td>
                  <td className="px-6 py-4 text-right font-mono text-lg font-bold">{c.voteCount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${c.percentage}%`, backgroundColor: chartColors[i % chartColors.length] }}
                        ></div>
                      </div>
                      <span className="font-mono font-medium w-12">{c.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {results.candidates.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
