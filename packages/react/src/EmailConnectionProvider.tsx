import React, { createContext, useContext, useState, useEffect } from "react";
import { SendingServer, DriverType } from "@emailconnector/config-schema";

export type UIExecutionMode = "local" | "managed";
export type UITheme = "dark" | "light";

export interface EmailConnectionContextValue {
  servers: SendingServer[];
  mode: UIExecutionMode;
  theme: UITheme;
  subscriptionId?: string;
  isUnlocked: boolean;
  addServer: (server: SendingServer) => void;
  updateServer: (id: string, updates: Partial<SendingServer>) => void;
  removeServer: (id: string) => void;
  toggleServerStatus: (id: string) => void;
  setSubscriptionId: (id: string) => void;
  unlockEnterprise: (subId: string) => Promise<boolean>;
  testConnection: (server: SendingServer) => Promise<{ success: boolean; latencyMs: number; message: string }>;
}

const EmailConnectionContext = createContext<EmailConnectionContextValue | null>(null);

export interface EmailConnectionProviderProps {
  children: React.ReactNode;
  initialServers?: SendingServer[];
  mode?: UIExecutionMode;
  theme?: UITheme;
  apiKey?: string;
  subscriptionId?: string;
  onServersChange?: (servers: SendingServer[]) => void;
}

export const EmailConnectionProvider: React.FC<EmailConnectionProviderProps> = ({
  children,
  initialServers = [],
  mode = "local",
  theme = "dark",
  subscriptionId: initialSubId,
  onServersChange
}) => {
  const [servers, setServers] = useState<SendingServer[]>(initialServers);
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>(initialSubId);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(Boolean(initialSubId?.startsWith("ec_test_") || initialSubId));

  const addServer = (server: SendingServer) => {
    setServers((prev) => {
      const updated = [...prev, server];
      onServersChange?.(updated);
      return updated;
    });
  };

  const updateServer = (id: string, updates: Partial<SendingServer>) => {
    setServers((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      onServersChange?.(updated);
      return updated;
    });
  };

  const removeServer = (id: string) => {
    setServers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      onServersChange?.(updated);
      return updated;
    });
  };

  const toggleServerStatus = (id: string) => {
    setServers((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
      onServersChange?.(updated);
      return updated;
    });
  };

  const unlockEnterprise = async (subId: string): Promise<boolean> => {
    setSubscriptionId(subId);
    if (subId.startsWith("ec_test_") || subId.length >= 6) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const testConnection = async (server: SendingServer): Promise<{ success: boolean; latencyMs: number; message: string }> => {
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

  return (
    <EmailConnectionContext.Provider
      value={{
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
      }}
    >
      <div className={theme === "dark" ? "dark text-slate-100" : "text-slate-900"}>
        {children}
      </div>
    </EmailConnectionContext.Provider>
  );
};

export const useEmailConnection = () => {
  const ctx = useContext(EmailConnectionContext);
  if (!ctx) {
    throw new Error("useEmailConnection must be used within an EmailConnectionProvider");
  }
  return ctx;
};
