import React, { useState } from "react";
import { useEmailConnection } from "./EmailConnectionProvider.js";
import { SendingServer } from "@emailconnector/config-schema";
import { CheckCircle2, XCircle, Play, Pause, Trash2, Zap, Server, ShieldCheck } from "lucide-react";

export interface SendingServersTableProps {
  onAddServerClick?: () => void;
  onUnlockClick?: () => void;
}

export const SendingServersTable: React.FC<SendingServersTableProps> = ({
  onAddServerClick,
  onUnlockClick
}) => {
  const { servers, toggleServerStatus, removeServer, testConnection, isUnlocked } =
    useEmailConnection();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const handleTest = async (server: SendingServer) => {
    setTestingId(server.id);
    setTestResult(null);
    try {
      const res = await testConnection(server);
      setTestResult({ id: server.id, success: res.success, message: res.message });
    } finally {
      setTestingId(null);
    }
  };

  const getPriorityBadgeClass = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case 2:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case 3:
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case 4:
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-2xl transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Sending Servers & Routing Cascade</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Zero-Trust In-Process
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Servers are dispatched in priority order (1 to 5). Fallback occurs automatically on 429s, 5xxs, or timeouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isUnlocked && onUnlockClick && (
            <button
              onClick={onUnlockClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Zap className="h-3.5 w-3.5" /> Unlock 20+ Enterprise ESPs
            </button>
          )}
          {onAddServerClick && (
            <button
              onClick={onAddServerClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20"
            >
              + Add Sending Server
            </button>
          )}
        </div>
      </div>

      {servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/20">
          <Server className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No sending servers connected yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-4">
            Connect your free Resend, Brevo, Mailjet, SendGrid, or local SMTP server to activate in-process quota load balancing.
          </p>
          {onAddServerClick && (
            <button
              onClick={onAddServerClick}
              className="rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Configure First Server
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Server / Name</th>
                <th className="px-4 py-3 font-semibold">Driver</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Daily Quota Usage</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
              {servers.map((server) => {
                const usedPct = Math.min(100, Math.round((server.dailyUsed / server.dailyLimit) * 100));
                const isTesting = testingId === server.id;

                return (
                  <tr key={server.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{server.name}</span>
                        {server.credentials.domain && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">({server.credentials.domain})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                        {server.driver}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPriorityBadgeClass(
                          server.priority
                        )}`}
                      >
                        Priority {server.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[180px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {server.dailyUsed} / {server.dailyLimit}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">{usedPct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            usedPct > 90 ? "bg-red-500" : usedPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleServerStatus(server.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          server.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {server.isActive ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        {server.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTest(server)}
                          disabled={isTesting}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                        >
                          {isTesting ? "Testing..." : "Test Ping"}
                        </button>
                        <button
                          onClick={() => removeServer(server.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {testResult && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs border ${
            testResult.success
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
          }`}
        >
          {testResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
};
