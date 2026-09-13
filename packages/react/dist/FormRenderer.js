import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Check, Sparkles, CheckCircle2 } from "lucide-react";
export const FormRenderer = ({ form, onSubmit, className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const inputRef = useRef(null);
    const fields = form.fields;
    const currentField = fields[currentIndex];
    const totalQuestions = fields.length;
    const progressPct = Math.round(((currentIndex) / totalQuestions) * 100);
    useEffect(() => {
        // Focus input on question transition
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentIndex]);
    const handleNext = () => {
        if (!currentField)
            return;
        // Check logic jumps if any
        let nextIndex = currentIndex + 1;
        if (currentField.logicJumps && currentField.logicJumps.length > 0) {
            const currentAns = answers[currentField.id];
            for (const jump of currentField.logicJumps) {
                if (jump.destinationQuestionId === "end") {
                    setIsCompleted(true);
                    onSubmit?.(answers);
                    return;
                }
                const targetIdx = fields.findIndex((f) => f.id === jump.destinationQuestionId);
                if (targetIdx !== -1) {
                    if (jump.condition === "equals" && currentAns === jump.value) {
                        nextIndex = targetIdx;
                        break;
                    }
                    if (jump.condition === "is_submitted") {
                        nextIndex = targetIdx;
                        break;
                    }
                }
            }
        }
        if (nextIndex >= fields.length) {
            setIsCompleted(true);
            onSubmit?.(answers);
        }
        else {
            setCurrentIndex(nextIndex);
        }
    };
    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleNext();
        }
    };
    const handleChoiceSelect = (optionId) => {
        setAnswers((prev) => ({ ...prev, [currentField.id]: optionId }));
        // Automatically advance on single choice
        setTimeout(() => {
            handleNext();
        }, 200);
    };
    if (isCompleted) {
        return (_jsxs("div", { className: `mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center shadow-2xl ${className}`, children: [_jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: _jsx(CheckCircle2, { className: "h-8 w-8" }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: form.thankYouTitle }), _jsx("p", { className: "text-sm text-slate-400 mb-6", children: form.thankYouMessage }), _jsxs("div", { className: "inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400 border border-slate-800", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5 text-emerald-400" }), " Powered by Email Connector Forms"] })] }));
    }
    return (_jsxs("div", { className: `mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl ${className}`, onKeyDown: handleKeyDown, children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400 mb-2", children: [_jsxs("span", { children: ["Question ", _jsx("strong", { className: "text-white font-mono", children: currentIndex + 1 }), " of ", totalQuestions] }), _jsxs("span", { className: "font-mono text-emerald-400", children: [progressPct, "%"] })] }), _jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800/80", children: _jsx("div", { className: "h-full bg-emerald-500 transition-all duration-300 rounded-full", style: { width: `${progressPct}%` } }) })] }), _jsxs("div", { className: "min-h-[220px]", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20", children: currentIndex + 1 }), _jsx("h3", { className: "text-xl font-bold tracking-tight text-white", children: currentField.label })] }), currentField.sublabel && (_jsx("p", { className: "text-sm text-slate-400 mb-6 ml-8", children: currentField.sublabel })), _jsxs("div", { className: "mt-6 ml-8", children: [currentField.type === "multiple_choice_single" && currentField.options && (_jsx("div", { className: "space-y-2.5", children: currentField.options.map((opt, idx) => {
                                    const isSelected = answers[currentField.id] === opt.id;
                                    return (_jsxs("button", { type: "button", onClick: () => handleChoiceSelect(opt.id), className: `flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all ${isSelected
                                            ? "border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10"
                                            : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-[11px] font-mono text-slate-400", children: idx + 1 }), _jsx("span", { children: opt.label })] }), isSelected && _jsx(Check, { className: "h-4 w-4 text-emerald-400" })] }, opt.id));
                                }) })), currentField.type === "rating" && (_jsx("div", { className: "flex items-center gap-2 py-4", children: [1, 2, 3, 4, 5].map((val) => {
                                    const isSelected = answers[currentField.id] === val;
                                    return (_jsx("button", { type: "button", onClick: () => {
                                            setAnswers((prev) => ({ ...prev, [currentField.id]: val }));
                                            setTimeout(() => handleNext(), 200);
                                        }, className: `flex h-12 w-12 items-center justify-center rounded-xl border text-base font-bold transition-all ${isSelected
                                            ? "border-emerald-500 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                                            : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800"}`, children: val }, val));
                                }) })), (currentField.type === "open_text" || currentField.type === "email" || currentField.type === "phone") && (_jsxs("div", { children: [_jsx("input", { ref: inputRef, type: currentField.type === "email" ? "email" : "text", placeholder: currentField.placeholder || "Type your answer here...", value: answers[currentField.id] || "", onChange: (e) => setAnswers({ ...answers, [currentField.id]: e.target.value }), className: "w-full border-b-2 border-slate-700 bg-transparent py-2 text-lg text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none" }), _jsxs("p", { className: "mt-2 text-xs text-slate-500", children: ["Press ", _jsx("kbd", { className: "rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300", children: "Enter \u21B5" }), " to proceed"] })] })), currentField.type === "consent" && (_jsxs("label", { className: "flex items-start gap-3 cursor-pointer py-2", children: [_jsx("input", { type: "checkbox", checked: Boolean(answers[currentField.id]), onChange: (e) => setAnswers({ ...answers, [currentField.id]: e.target.checked }), className: "mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500" }), _jsx("span", { className: "text-sm text-slate-300 leading-relaxed", children: currentField.consentText || currentField.label })] }))] })] }), _jsxs("div", { className: "mt-8 flex items-center justify-between border-t border-slate-800/80 pt-4", children: [_jsxs("button", { type: "button", onClick: handlePrev, disabled: currentIndex === 0, className: `inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${currentIndex === 0 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-white hover:bg-slate-900"}`, children: [_jsx(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back"] }), _jsxs("button", { type: "button", onClick: handleNext, className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20", children: [currentIndex === fields.length - 1 ? "Submit" : currentField.buttonLabel || "Next", _jsx(ArrowRight, { className: "h-3.5 w-3.5" })] })] })] }));
};
//# sourceMappingURL=FormRenderer.js.map