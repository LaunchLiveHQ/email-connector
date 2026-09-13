import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useEmailConnection } from "./EmailConnectionProvider.js";
import { X, Zap, CheckCircle2, AlertCircle } from "lucide-react";
export const SubscriptionUnlockModal = ({ isOpen, onClose }) => {
    const { unlockEnterprise, isUnlocked, subscriptionId } = useEmailConnection();
    const [subInput, setSubInput] = useState(subscriptionId || "");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    if (!isOpen)
        return null;
    const handleVerify = async (e) => {
        e.preventDefault();
        if (!subInput.trim())
            return;
        setIsLoading(true);
        setStatus(null);
        try {
            const ok = await unlockEnterprise(subInput.trim());
            if (ok) {
                setStatus({
                    success: true,
                    message: "Enterprise License Active! All 20+ enterprise ESP drivers unlocked."
                });
            }
            else {
                setStatus({
                    success: false,
                    message: "Unable to verify subscription ID. Please check and try again."
                });
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4", children: _jsxs("div", { className: "relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl transition-colors", children: [_jsx("button", { onClick: onClose, className: "absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 border border-amber-500/20", children: _jsx(Zap, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-900 dark:text-white", children: "Unlock Enterprise ESPs" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "Enter your Email Connector Subscription ID" })] })] }), _jsx("p", { className: "text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed", children: "Subscribers to Email Connector Pro or Enterprise can unlock drivers for Postmark, AWS SES, Mailtrap, Mandrill, ZeptoMail, Mailgun, and 15+ more modern ESPs directly in their local SDK." }), _jsxs("form", { onSubmit: handleVerify, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1", children: "Subscription License ID" }), _jsx("input", { type: "text", placeholder: "e.g. ec_test_enterprise or sub_live_...", value: subInput, onChange: (e) => setSubInput(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none font-mono" }), _jsxs("p", { className: "text-[11px] text-slate-500 mt-1", children: ["Tip: Use ", _jsx("code", { className: "text-amber-600 dark:text-amber-400 font-mono font-semibold", children: "ec_test_enterprise" }), " for instant offline test validation."] })] }), status && (_jsxs("div", { className: `flex items-center gap-2 rounded-lg p-3 text-xs border ${status.success
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"}`, children: [status.success ? _jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" }) : _jsx(AlertCircle, { className: "h-4 w-4 text-red-500 dark:text-red-400 shrink-0" }), _jsx("span", { children: status.message })] })), _jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "rounded-lg px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors", children: "Close" }), _jsx("button", { type: "submit", disabled: isLoading, className: "rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20", children: isLoading ? "Verifying..." : "Verify & Unlock" })] })] })] }) }));
};
//# sourceMappingURL=SubscriptionUnlockModal.js.map