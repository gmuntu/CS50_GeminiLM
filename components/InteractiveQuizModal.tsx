"use client";

import React, { useState } from "react";

export interface QuizQuestionData {
  id: string;
  order: number;
  question: string;
  options: Array<{ id: string; label: string; text: string }>;
  correctOption: string;
  explanation: string;
  conceptTested: string;
}

export interface QuizData {
  id: string;
  dayOfWeek: "MONDAY" | "WEDNESDAY" | "FRIDAY";
  title: string;
  description?: string;
  questions: QuizQuestionData[];
}

interface Props {
  quiz: QuizData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveQuizModal({ quiz, isOpen, onClose }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    review: Array<{
      questionId: string;
      question: string;
      selectedOption: string | null;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
      conceptTested: string;
    }>;
    socraticFeedback: string;
  } | null>(null);

  if (!isOpen || !quiz) return null;

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return; // Verrouillé après soumission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !quiz) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/content/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur de correction.");
      }

      setResult(data);
    } catch (err: any) {
      alert(err.message || "Impossible de corriger le quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  const dayLabels = {
    MONDAY: "Lundi (Intuition)",
    WEDNESDAY: "Mercredi (Code & Mécanique)",
    FRIDAY: "Vendredi (Vision Ingénieur)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto overscroll-contain">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        
        {/* En-tête */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex justify-between items-start sm:items-center bg-slate-950/60 gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-indigo-600/30 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                {dayLabels[quiz.dayOfWeek] || quiz.dayOfWeek}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{quiz.title}</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              {quiz.description || "Évaluez votre compréhension conceptuelle."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition shrink-0"
            aria-label="Fermer le quiz"
          >
            ✕
          </button>
        </div>

        {/* Corps du Quiz */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 custom-scrollbar">
          
          {/* Bannière de Résultat */}
          {result && (
            <div
              className={`p-3.5 sm:p-4 rounded-xl border ${
                result.passed
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-200"
              } space-y-2 animate-in fade-in duration-300`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  {result.passed ? "🎉 Félicitations !" : "📚 À perfectionner"}
                </span>
                <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-900/80 rounded-full border border-slate-700 w-fit">
                  Score : {result.score} / {result.total} ({result.percentage}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                « {result.socraticFeedback} »
              </p>
            </div>
          )}

          {/* Liste des questions */}
          {quiz.questions.map((q, qIndex) => {
            const reviewItem = result?.review?.find((r) => r.questionId === q.id);
            const userChoice = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                className="bg-slate-950/60 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-2.5 sm:space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                    <span className="text-indigo-400 mr-1.5">Q{qIndex + 1}.</span>
                    {q.question}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap w-fit">
                    {q.conceptTested}
                  </span>
                </div>

                {/* Options A, B, C, D */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = userChoice === opt.id;
                    let optionStyle = "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300";

                    if (result) {
                      if (opt.id === q.correctOption) {
                        optionStyle = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-medium";
                      } else if (isSelected && !reviewItem?.isCorrect) {
                        optionStyle = "border-rose-500/80 bg-rose-950/40 text-rose-200 line-through opacity-80";
                      } else {
                        optionStyle = "border-slate-900 bg-slate-950 text-slate-600 opacity-50";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-indigo-500 bg-indigo-600/25 text-indigo-100 shadow-md";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelect(q.id, opt.id)}
                        disabled={Boolean(result)}
                        className={`w-full text-left p-2.5 sm:p-3 min-h-[44px] rounded-lg border text-xs flex items-center gap-2.5 sm:gap-3 transition-all ${optionStyle}`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {result && opt.id === q.correctOption && (
                          <span className="text-emerald-400 text-xs font-bold shrink-0">✓ Bonne réponse</span>
                        )}
                        {result && isSelected && !reviewItem?.isCorrect && (
                          <span className="text-rose-400 text-xs font-bold shrink-0">✗ Piège</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explication Socratique affichée après correction */}
                {result && (
                  <div className="mt-3 p-3 rounded-lg bg-indigo-950/25 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1">
                      💡 Explication Socratique :
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pied de page / Actions avec Safe Area iPhone */}
        <div className="p-3.5 sm:p-4 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-0">
          <span className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} sur {quiz.questions.length} question(s) renseignée(s)
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {result ? (
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition text-center"
              >
                🔄 Recommencer le quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {isSubmitting ? "Correction en cours..." : "Valider mes réponses"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
