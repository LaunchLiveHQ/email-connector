import React from "react";
import { SendingServer } from "@emailconnector/config-schema";
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
    testConnection: (server: SendingServer) => Promise<{
        success: boolean;
        latencyMs: number;
        message: string;
    }>;
}
export interface EmailConnectionProviderProps {
    children: React.ReactNode;
    initialServers?: SendingServer[];
    mode?: UIExecutionMode;
    theme?: UITheme;
    apiKey?: string;
    subscriptionId?: string;
    onServersChange?: (servers: SendingServer[]) => void;
}
export declare const EmailConnectionProvider: React.FC<EmailConnectionProviderProps>;
export declare const useEmailConnection: () => EmailConnectionContextValue;
//# sourceMappingURL=EmailConnectionProvider.d.ts.map