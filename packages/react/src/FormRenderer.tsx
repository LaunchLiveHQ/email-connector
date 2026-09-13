import React, { useState, useEffect, useRef } from "react";
import { FormDefinition, FormField } from "@emailconnector/config-schema";
import { ArrowRight, ArrowLeft, Check, Sparkles, CheckCircle2 } from "lucide-react";

export interface FormRendererProps {
  form: FormDefinition;
  onSubmit?: (answers: Record<string, any>) => void;
  className?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fields = form.fields;
  const currentField: FormField | undefined = fields[currentIndex];
  const totalQuestions = fields.length;
  const progressPct = Math.round(((currentIndex) / totalQuestions) * 100);

  useEffect(() => {
    // Focus input on question transition
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (!currentField) return;

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
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleChoiceSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentField.id]: optionId }));
    // Automatically advance on single choice
    setTimeout(() => {
      handleNext();
    }, 200);
  };

  if (isCompleted) {
    return (
      <div className={`mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center shadow-2xl ${className}`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{form.thankYouTitle}</h2>
        <p className="text-sm text-slate-400 mb-6">{form.thankYouMessage}</p>
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400 border border-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Powered by Email Connector Forms
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl ${className}`} onKeyDown={handleKeyDown}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            Question <strong className="text-white font-mono">{currentIndex + 1}</strong> of {totalQuestions}
          </span>
          <span className="font-mono text-emerald-400">{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800/80">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="min-h-[220px]">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            {currentIndex + 1}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white">{currentField.label}</h3>
        </div>
        {currentField.sublabel && (
          <p className="text-sm text-slate-400 mb-6 ml-8">{currentField.sublabel}</p>
        )}

        <div className="mt-6 ml-8">
          {/* Multiple Choice Single */}
          {currentField.type === "multiple_choice_single" && currentField.options && (
            <div className="space-y-2.5">
              {currentField.options.map((opt, idx) => {
                const isSelected = answers[currentField.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChoiceSelect(opt.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-[11px] font-mono text-slate-400">
                        {idx + 1}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Rating Scale */}
          {currentField.type === "rating" && (
            <div className="flex items-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = answers[currentField.id] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [currentField.id]: val }));
                      setTimeout(() => handleNext(), 200);
                    }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border text-base font-bold transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}

          {/* Open Text or Email */}
          {(currentField.type === "open_text" || currentField.type === "email" || currentField.type === "phone") && (
            <div>
              <input
                ref={inputRef}
                type={currentField.type === "email" ? "email" : "text"}
                placeholder={currentField.placeholder || "Type your answer here..."}
                value={answers[currentField.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [currentField.id]: e.target.value })}
                className="w-full border-b-2 border-slate-700 bg-transparent py-2 text-lg text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Enter ↵</kbd> to proceed
              </p>
            </div>
          )}

          {/* Consent */}
          {currentField.type === "consent" && (
            <label className="flex items-start gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={Boolean(answers[currentField.id])}
                onChange={(e) => setAnswers({ ...answers, [currentField.id]: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-300 leading-relaxed">
                {currentField.consentText || currentField.label}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            currentIndex === 0 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          {currentIndex === fields.length - 1 ? "Submit" : currentField.buttonLabel || "Next"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
