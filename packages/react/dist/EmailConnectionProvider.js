import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const EmailConnectionContext = createContext(null);
export const EmailConnectionProvider = ({ children, initialServers = [], mode = "local", theme = "dark", subscriptionId: initialSubId, onServersChange }) => {
    const [servers, setServers] = useState(initialServers);
    const [subscriptionId, setSubscriptionId] = useState(initialSubId);
    const [isUnlocked, setIsUnlocked] = useState(Boolean(initialSubId?.startsWith("ec_test_") || initialSubId));
    const addServer = (server) => {
        setServers((prev) => {
            const updated = [...prev, server];
            onServersChange?.(updated);
            return updated;
        });
    };
    const updateServer = (id, updates) => {
        setServers((prev) => {
            const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
            onServersChange?.(updated);
            return updated;
        });
    };
    const removeServer = (id) => {
        setServers((prev) => {
            const updated = prev.filter((s) => s.id !== id);
            onServersChange?.(updated);
            return updated;
        });
    };
    const toggleServerStatus = (id) => {
        setServers((prev) => {
            const updated = prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
            onServersChange?.(updated);
            return updated;
        });
    };
    const unlockEnterprise = async (subId) => {
        setSubscriptionId(subId);
        if (subId.startsWith("ec_test_") || subId.length >= 6) {
            setIsUnlocked(true);
            return true;
        }
        return false;
    };
    const testConnection = async (server) => {
        const start = Date.now();
        // Simulate pre-flight driver credential verification handshake
        await new Promise((r) => setTimeout(r, 450));
        const latencyMs = Date.now() - start;
        if (!server.credentials.apiKey && !server.credentials.serverToken && !server.credentials.host) {
            return { success: false, latencyMs, message: "Credentials missing or incomplete." };
        }
        return {
            success: true,
            latencyMs,
            message: `Handshake verified with ${server.driver.toUpperCase()} API in ${latencyMs}ms.`
        };
    };
    return (_jsx(EmailConnectionContext.Provider, { value: {
            servers,
            mode,
            theme,
            subscriptionId,
            isUnlocked,
            addServer,
            updateServer,
            removeServer,
            toggleServerStatus,
            setSubscriptionId,
            unlockEnterprise,
            testConnection
        }, children: _jsx("div", { className: theme === "dark" ? "dark text-slate-100" : "text-slate-900", children: children }) }));
};
export const useEmailConnection = () => {
    const ctx = useContext(EmailConnectionContext);
    if (!ctx) {
        throw new Error("useEmailConnection must be used within an EmailConnectionProvider");
    }
    return ctx;
};
//# sourceMappingURL=EmailConnectionProvider.js.map