import React from "react";
import { InboxProvider } from "@emailconnector/config-schema";
export interface InboxConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect?: (connection: {
        provider: InboxProvider;
        address: string;
    }) => void;
}
export declare const InboxConnectorModal: React.FC<InboxConnectorModalProps>;
//# sourceMappingURL=InboxConnectorModal.d.ts.map