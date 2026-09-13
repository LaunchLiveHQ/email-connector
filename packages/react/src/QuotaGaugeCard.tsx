import React from "react";
import { useEmailConnection } from "./EmailConnectionProvider.js";
import { Zap, ShieldCheck } from "lucide-react";

export const QuotaGaugeCard: React.FC = () => {
  const { servers } = useEmailConnection();

  const totalDailyLimit = servers.reduce((acc, s) => (s.isActive ? acc + s.dailyLimit : acc), 0);
  const totalDailyUsed = servers.reduce((acc, s) => (s.isActive ? acc + s.dailyUsed : acc), 0);
  const monthlyEst = totalDailyLimit * 30;

  const usedPct = totalDailyLimit > 0 ? Math.min(100, Math.round((totalDailyUsed / totalDailyLimit) * 100)) : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Aggregated Quota Pool</h4>
            <p className="text-xs text-slate-400">Zero-trust local daily quota rotation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            ~{monthlyEst.toLocaleString()} / mo
          </span>
          <p className="text-[10px] text-slate-500">Free Pool Capacity</p>
        </div>
      </div>

      <div className="space-y-1.5 mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Today's Dispatch: <strong className="text-white font-mono">{totalDailyUsed}</strong> / {totalDailyLimit} emails
          </span>
          <span className="font-mono text-emerald-400 font-semibold">{usedPct}% used</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(usedPct, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Direct HTTPS Client-to-Provider
        </span>
        <span className="text-slate-500">
          Active Servers: <strong className="text-slate-300">{servers.filter((s) => s.isActive).length}</strong>
        </span>
      </div>
    </div>
  );
};
