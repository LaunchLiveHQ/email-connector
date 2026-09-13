import React, { useState } from "react";
import { useEmailConnection } from "./EmailConnectionProvider.js";
import { X, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export interface SubscriptionUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionUnlockModal: React.FC<SubscriptionUnlockModalProps> = ({
  isOpen,
  onClose
}) => {
  const { unlockEnterprise, isUnlocked, subscriptionId } = useEmailConnection();
  const [subInput, setSubInput] = useState(subscriptionId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subInput.trim()) return;

    setIsLoading(true);
    setStatus(null);
    try {
      const ok = await unlockEnterprise(subInput.trim());
      if (ok) {
        setStatus({
          success: true,
          message: "Enterprise License Active! All 20+ enterprise ESP drivers unlocked."
        });
      } else {
        setStatus({
          success: false,
          message: "Unable to verify subscription ID. Please check and try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Unlock Enterprise ESPs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your Email Connector Subscription ID</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Subscribers to Email Connector Pro or Enterprise can unlock drivers for Postmark, AWS SES, Mailtrap,
          Mandrill, ZeptoMail, Mailgun, and 15+ more modern ESPs directly in their local SDK.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subscription License ID
            </label>
            <input
              type="text"
              placeholder="e.g. ec_test_enterprise or sub_live_..."
              value={subInput}
              onChange={(e) => setSubInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: Use <code className="text-amber-600 dark:text-amber-400 font-mono font-semibold">ec_test_enterprise</code> for instant offline test validation.
            </p>
          </div>

          {status && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-xs border ${
                status.success
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                  : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
              }`}
            >
              {status.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              {isLoading ? "Verifying..." : "Verify & Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
