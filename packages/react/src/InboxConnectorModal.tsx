import React, { useState } from "react";
import { InboxProvider } from "@emailconnector/config-schema";
import { X, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface InboxConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (connection: { provider: InboxProvider; address: string }) => void;
}

export const InboxConnectorModal: React.FC<InboxConnectorModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [provider, setProvider] = useState<InboxProvider>("cloudflare");
  const [address, setAddress] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    onConnect?.({ provider, address: address.trim() });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Connect Universal Mailbox</h3>
            <p className="text-xs text-slate-400">Inbound OTP & Thread Synchronization</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Connect your mailbox or domain routing to ingest incoming emails, extract OTP codes, and make
          messages available to your AI agents via Model Context Protocol (MCP).
        </p>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mailbox Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as InboxProvider)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="cloudflare">Cloudflare Email Routing (Custom Domain / Worker)</option>
              <option value="gmail">Google Gmail (API / OAuth 2.0)</option>
              <option value="outlook">Microsoft 365 / Outlook (Graph API)</option>
              <option value="imap">Generic IMAP Relay (Self-Hosted / Corporate)</option>
              <option value="webhook">Custom Webhook Intake</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mailbox Email Address
            </label>
            <input
              type="email"
              placeholder="e.g., agent@mybrand.com or alerts@gmail.com"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {isSuccess && (
            <div className="flex items-center gap-2 rounded-lg p-3 text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Mailbox connected successfully! Initializing synchronization...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> AES-256-GCM encrypted
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Connect Mailbox
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
