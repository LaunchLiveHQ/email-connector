import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useEmailConnection } from "./EmailConnectionProvider.js";
import { X, CheckCircle2, XCircle, ShieldCheck, Sparkles } from "lucide-react";
const FREE_PROVIDERS = [
    { id: "resend", name: "Resend", freeQuota: "100/day (3,000/mo)" },
    { id: "brevo", name: "Brevo", freeQuota: "300/day (9,000/mo)" },
    { id: "mailjet", name: "Mailjet", freeQuota: "200/day (6,000/mo)" },
    { id: "mailersend", name: "MailerSend", freeQuota: "100/day (3,000/mo)" },
    { id: "sendgrid", name: "Twilio SendGrid", freeQuota: "100/day (3,000/mo)" },
    { id: "smtp", name: "Custom SMTP / Mailpit", freeQuota: "Unlimited Local/Dev" }
];
const ENTERPRISE_PROVIDERS = [
    { id: "postmark", name: "Postmark" },
    { id: "aws_ses", name: "AWS SES" },
    { id: "zeptomail", name: "ZeptoMail (Zoho)" },
    { id: "mailtrap", name: "Mailtrap" },
    { id: "mailgun", name: "Mailgun" },
    { id: "smtp2go", name: "SMTP2GO" },
    { id: "scaleway", name: "Scaleway TEM" },
    { id: "mandrill", name: "Mailchimp Mandrill" },
    { id: "bird", name: "Bird (SparkPost)" },
    { id: "netcore", name: "Netcore Cloud" },
    { id: "sender", name: "Sender.net" },
    { id: "emailoctopus", name: "EmailOctopus" },
    { id: "reloop", name: "Reloop" },
    { id: "lettr", name: "Lettr" },
    { id: "jetemail", name: "JetEmail" },
    { id: "primitive", name: "Primitive" },
    { id: "camelmailer", name: "CamelMailer" },
    { id: "agentmail", name: "AgentMail" },
    { id: "sendkit", name: "SendKit" },
    { id: "inbound", name: "Inbound.new" },
    { id: "sequenzy", name: "Sequenzy" },
    { id: "knock", name: "Knock" },
    { id: "courier", name: "Courier" }
];
export const AddServerModal = ({ isOpen, onClose }) => {
    const { addServer, testConnection, isUnlocked } = useEmailConnection();
    const [driver, setDriver] = useState("resend");
    const [name, setName] = useState("");
    const [priority, setPriority] = useState(1);
    const [dailyLimit, setDailyLimit] = useState(100);
    // Dynamic credentials
    const [apiKey, setApiKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [serverToken, setServerToken] = useState("");
    const [domain, setDomain] = useState("");
    const [region, setRegion] = useState("us-east-1");
    const [host, setHost] = useState("");
    const [port, setPort] = useState(587);
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [encryption, setEncryption] = useState("tls");
    // Inline pre-flight test status
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState(null);
    if (!isOpen)
        return null;
    const handleDriverChange = (newDriver) => {
        setDriver(newDriver);
        setVerifyResult(null);
        // Set smart defaults for daily caps
        if (newDriver === "brevo")
            setDailyLimit(300);
        else if (newDriver === "mailjet")
            setDailyLimit(200);
        else if (newDriver === "smtp")
            setDailyLimit(5000);
        else if (newDriver === "aws_ses")
            setDailyLimit(50000);
        else
            setDailyLimit(100);
    };
    const handlePreFlightTest = async () => {
        setIsVerifying(true);
        setVerifyResult(null);
        const testServer = {
            id: "temp_test",
            name: name || `${driver.toUpperCase()} Server`,
            driver,
            priority,
            dailyLimit,
            dailyUsed: 0,
            credentials: {
                apiKey: apiKey || undefined,
                secretKey: secretKey || undefined,
                serverToken: serverToken || undefined,
                domain: domain || undefined,
                region,
                host: host || undefined,
                port,
                user: user || undefined,
                password: password || undefined,
                encryption
            },
            isActive: true,
            isHealthy: true
        };
        try {
            const res = await testConnection(testServer);
            setVerifyResult({ success: res.success, message: res.message });
        }
        finally {
            setIsVerifying(false);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const newServer = {
            id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: name.trim() || `${driver.toUpperCase()} Server`,
            driver,
            priority,
            dailyLimit,
            dailyUsed: 0,
            credentials: {
                apiKey: apiKey.trim() || undefined,
                secretKey: secretKey.trim() || undefined,
                serverToken: serverToken.trim() || undefined,
                domain: domain.trim() || undefined,
                region,
                host: host.trim() || undefined,
                port,
                user: user.trim() || undefined,
                password: password || undefined,
                encryption
            },
            isActive: true,
            isHealthy: true
        };
        addServer(newServer);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4", children: _jsxs("div", { className: "relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl transition-colors", children: [_jsx("button", { onClick: onClose, className: "absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white", children: "Add Sending Server" }), _jsxs("span", { className: "flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20", children: [_jsx(ShieldCheck, { className: "h-3 w-3" }), " Zero-Trust"] })] }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1", children: "Credentials stay strictly inside your local runtime. Test the handshake before activating." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1", children: "Provider / Driver" }), _jsxs("select", { value: driver, onChange: (e) => handleDriverChange(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none", children: [_jsx("optgroup", { label: "Free Core Providers (24k Free Quota Pool)", children: FREE_PROVIDERS.map((p) => (_jsxs("option", { value: p.id, children: [p.name, " \u2014 ", p.freeQuota] }, p.id))) }), _jsx("optgroup", { label: "Enterprise & Modern ESPs (Paid Plan / Subscribed)", children: ENTERPRISE_PROVIDERS.map((p) => (_jsxs("option", { value: p.id, disabled: !isUnlocked, children: [p.name, " ", !isUnlocked ? "(Subscription Required)" : ""] }, p.id))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1", children: "Server Label / Name" }), _jsx("input", { type: "text", placeholder: "e.g., Production Resend Relay", value: name, onChange: (e) => setName(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 p-4 space-y-3", children: [_jsxs("h4", { className: "text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400", children: [driver.toUpperCase(), " Connection Credentials"] }), driver === "smtp" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "SMTP Host" }), _jsx("input", { type: "text", placeholder: "localhost or smtp.relay.com", value: host, onChange: (e) => setHost(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "Port" }), _jsx("input", { type: "number", value: port, onChange: (e) => setPort(parseInt(e.target.value, 10)), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "Username (Optional)" }), _jsx("input", { type: "text", value: user, onChange: (e) => setUser(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] })] })] })) : driver === "postmark" ? (_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "Postmark Server Token" }), _jsx("input", { type: "password", placeholder: "25048xxx-xxxx-xxxx", value: serverToken, onChange: (e) => setServerToken(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono" })] })) : driver === "aws_ses" ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "AWS Access Key ID" }), _jsx("input", { type: "text", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "AWS Secret Access Key" }), _jsx("input", { type: "password", value: secretKey, onChange: (e) => setSecretKey(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "AWS Region" }), _jsx("input", { type: "text", value: region, onChange: (e) => setRegion(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] })] })] })) : driver === "mailjet" ? (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "API Key" }), _jsx("input", { type: "text", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "Secret Key" }), _jsx("input", { type: "password", value: secretKey, onChange: (e) => setSecretKey(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono" })] })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "API Key / Token" }), _jsx("input", { type: "password", placeholder: `Enter your ${driver} API key`, value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-mono" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-slate-600 dark:text-slate-400 mb-1", children: "Verified Sending Domain (Optional)" }), _jsx("input", { type: "text", placeholder: "notifications.mybrand.com", value: domain, onChange: (e) => setDomain(e.target.value), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1", children: "Priority Level (1 to 5)" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(parseInt(e.target.value, 10)), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none", children: [_jsx("option", { value: 1, children: "Priority 1 (Primary Dispatch)" }), _jsx("option", { value: 2, children: "Priority 2 (First Fallback)" }), _jsx("option", { value: 3, children: "Priority 3 (Second Fallback)" }), _jsx("option", { value: 4, children: "Priority 4 (Tertiary Fallback)" }), _jsx("option", { value: 5, children: "Priority 5 (Emergency Relay)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1", children: "Daily Email Quota Limit" }), _jsx("input", { type: "number", min: 1, value: dailyLimit, onChange: (e) => setDailyLimit(parseInt(e.target.value, 10)), className: "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" })] })] }), verifyResult && (_jsxs("div", { className: `flex items-center gap-2 rounded-lg p-3 text-xs border ${verifyResult.success
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"}`, children: [verifyResult.success ? _jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500 dark:text-emerald-400" }) : _jsx(XCircle, { className: "h-4 w-4 text-red-500 dark:text-red-400" }), _jsx("span", { children: verifyResult.message })] })), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800", children: [_jsxs("button", { type: "button", onClick: handlePreFlightTest, disabled: isVerifying, className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5 text-amber-500 dark:text-amber-400" }), isVerifying ? "Verifying Handshake..." : "Verify Handshake"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "rounded-lg px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", className: "rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20", children: "Save & Activate Server" })] })] })] })] }) }));
};
//# sourceMappingURL=AddServerModal.js.map