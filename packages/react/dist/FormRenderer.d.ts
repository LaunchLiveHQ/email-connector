import React from "react";
import { FormDefinition } from "@emailconnector/config-schema";
export interface FormRendererProps {
    form: FormDefinition;
    onSubmit?: (answers: Record<string, any>) => void;
    className?: string;
}
export declare const FormRenderer: React.FC<FormRendererProps>;
//# sourceMappingURL=FormRenderer.d.ts.map