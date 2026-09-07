"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CS50_MODULES } from "@/config/courseModules";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import InteractiveQuizModal, { QuizData } from "./InteractiveQuizModal";

interface Message {
  role: "user" | "model";
  text: string;
}

interface Props {
  moduleId: number;
  pedagogicalData?: any;
  onInteract?: () => void;
  onContentUpdated?: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

type DayType = "MONDAY" | "WEDNESDAY" | "FRIDAY";

export default function CourseAssistantSidebar({
  moduleId,
  pedagogicalData,
  onInteract,
  onContentUpdated,
  isOpenOnMobile = false,
  onCloseMobile,
}: Props) {
  const currentModule = CS50_MODULES[moduleId] ?? CS50_MODULES[0];

  // Gestion du lecteur vidéo local/YouTube
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(currentModule.videoUrl);

  // Gestion des 3 sessions audio Socratiques (Lundi, Mercredi, Jeudi)
  const [selectedDay, setSelectedDay] = useState<DayType>("MONDAY");
  const [isPlayingDayAudio, setIsPlayingDayAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Chat avec Socrate
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Bonjour ! Je suis Socrate, ton tuteur pour : **${
        currentModule?.title ?? "ce cours"
      }**. Quelle notion souhaites-tu explorer ou approfondir aujourd'hui ?`,
    },
  ]);
  const [input, setInput] = useState("");

  // Réinitialiser les messages quand le module change
  useEffect(() => {
    setMessages([
      {
        role: "model",
        text: `Bonjour ! Je suis Socrate, ton tuteur pour : **${
          currentModule?.title ?? "ce cours"
        }**. Quelle notion souhaites-tu explorer ou approfondir aujourd'hui ?`,
      },
    ]);
  }, [moduleId, currentModule?.id, currentModule?.title]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveVideoUrl(currentModule.videoUrl);
    setSelectedDay("MONDAY");
    setShowDialogue(false);
  }, [currentModule]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.onended = null;
      }
    };
  }, [currentAudio]);

  const stopAllAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.onended = null;
      setCurrentAudio(null);
    }
    setIsPlayingDayAudio(false);
    setIsAudioLoading(false);
  }, [currentAudio]);

  // Récupération des données du script audio et quiz du jour sélectionné
  const audioScriptsList: any[] = pedagogicalData?.audioScripts || [];
  const quizzesList: any[] = pedagogicalData?.quizzes || [];

  const currentAudioScript = audioScriptsList.find((a: any) => a.dayOfWeek === selectedDay);
  const currentQuiz: QuizData | null = quizzesList.find((q: any) => q.dayOfWeek === selectedDay) || null;

  // Lecture TTS de la session audio du jour
  const playDayAudio = async () => {
    if (isPlayingDayAudio) {
      stopAllAudio();
      return;
    }

    if (!currentAudioScript?.cleanTtsText) {
      alert("Script audio non disponible pour ce jour. Vous pouvez le générer avec Gemini sur la page principale !");
      return;
    }

    stopAllAudio();
    if (onInteract) onInteract();
    setIsAudioLoading(true);

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentAudioScript.cleanTtsText.slice(0, 4000) }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erreur lors de la synthèse vocale.");
      }

      const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
      setIsPlayingDayAudio(true);
      setIsAudioLoading(false);

      audio.onended = () => {
        setIsPlayingDayAudio(false);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (err: any) {
      console.error("Erreur lecture audio socratique :", err);
      alert(err.message || "Impossible de lancer la voix de Socrate.");
      setIsPlayingDayAudio(false);
      setIsAudioLoading(false);
    }
  };

  const handleDownloadAudio = async () => {
    if (!currentAudioScript?.cleanTtsText) {
      alert("Script audio non disponible pour ce jour.");
      return;
    }

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentAudioScript.cleanTtsText.slice(0, 4000) }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erreur lors de la synthèse vocale.");
      }

      const audioData = "data:audio/mp3;base64," + data.audioContent;
      const a = document.createElement("a");
      a.href = audioData;
      a.download = `Socrate_Semaine${moduleId}_${selectedDay}.mp3`;
      a.click();
    } catch (err: any) {
      console.error("Erreur téléchargement audio :", err);
      alert(err.message || "Impossible de télécharger l'audio.");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (onInteract) onInteract();
    const userMsg = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
      { role: "model", text: "" },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "cmtopzd8b00003mwxnudf9q67",
          moduleId: String(currentModule.id),
          content: userMsg,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Code d'erreur ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "model") {
            updated[updated.length - 1] = {
              ...lastMsg,
              text: lastMsg.text + chunk,
            };
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Erreur streaming tuteur :", err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        const partial = lastMsg && lastMsg.role === "model" ? lastMsg.text : "";
        updated[updated.length - 1] = {
          role: "model",
          text: partial
            ? `${partial}\n\n⚠️ *Une erreur est survenue lors de la réponse.*`
            : "⚠️ Impossible de contacter Socrate.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    stopAllAudio();
    if (onInteract) onInteract();

    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "fr-FR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript ?? "";
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error("Erreur micro :", err);
      setIsListening(false);
    }
  };

  const toggleSpeech = async (text: string, idx: number) => {
    if (speakingIdx === idx) {
      stopAllAudio();
      setSpeakingIdx(null);
      return;
    }

    stopAllAudio();
    if (onInteract) onInteract();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, " [code omis] ")
      .replace(/`[^`]*`/g, " [code] ")
      .replace(/[*_#]/g, "")
      .trim();

    if (!cleanText) return;
    setSpeakingIdx(idx);

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erreur TTS");
      }

      const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
      audio.onended = () => {
        setSpeakingIdx(null);
        setCurrentAudio(null);
      };
      setCurrentAudio(audio);
      await audio.play();
    } catch (err: any) {
      console.error("Erreur TTS :", err);
      alert(err.message || "Erreur de synthèse vocale.");
      setSpeakingIdx(null);
    }
  };

  const handleQuickAction = (text: string) => {
    stopAllAudio();
    if (onInteract) onInteract();
    setInput(text);
  };

  return (
    <>
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-50 h-screen w-full sm:w-96 bg-slate-950 text-slate-100 p-4 shadow-2xl flex flex-col overflow-y-auto custom-scrollbar border-l border-slate-800 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-screen lg:shrink-0 lg:border-l-0
          ${isOpenOnMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          ${!isOpenOnMobile ? "hidden lg:flex" : "flex"}
        `}
      >
        {/* Entête Mobile de fermeture */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <h3 className="font-bold text-sm text-white">Socrate — Tuteur Vocal</h3>
              <p className="text-[11px] text-indigo-400 font-medium">{currentModule.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            aria-label="Fermer le tuteur Socrate"
          >
            ✕
          </button>
        </div>
        
        {/* --- PANNEAU PÉDAGOGIQUE DU MODULE --- */}
        <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden space-y-3">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 1. SÉLECTEUR DES 3 AUDIOS SOCRATIQUES (LUNDI, MERCREDI, JEUDI) */}
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <span>🎙️</span> Audios Socratiques (3x / sem)
              </span>
              {currentAudioScript && (
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                  Prêt pour écoute
                </span>
              )}
            </div>

            {/* Boutons des 3 jours */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
              {(["MONDAY", "WEDNESDAY", "FRIDAY"] as DayType[]).map((day) => {
                const labels: Record<DayType, string> = {
                  MONDAY: "Lundi",
                  WEDNESDAY: "Mercredi",
                  FRIDAY: "Vendredi",
                };
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      stopAllAudio();
                      setSelectedDay(day);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    {labels[day]}
                  </button>
                );
              })}
            </div>

            {/* Carte descriptive de la session du jour */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-start gap-2">
                <h5 className="font-bold text-slate-200 leading-snug">
                  {currentAudioScript?.title || `Session du ${selectedDay === "MONDAY" ? "Lundi" : selectedDay === "WEDNESDAY" ? "Mercredi" : "Vendredi"}`}
                </h5>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">~5 min</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                {currentAudioScript?.pedagogicalObjective || "Objectif : Développer une compréhension profonde par le questionnement Socratique."}
              </p>

              {/* Boutons d'action audio & quiz */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={playDayAudio}
                  disabled={isAudioLoading}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isPlayingDayAudio
                      ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
                  }`}
                >
                  <span>{isPlayingDayAudio ? "⏹️" : isAudioLoading ? "⏳" : "▶️"}</span>
                  {isPlayingDayAudio ? "Arrêter la voix" : isAudioLoading ? "Synthèse en cours..." : "Écouter avec Socrate"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAudio}
                  title="Télécharger l'audio en MP3"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 shadow transition flex items-center justify-center shrink-0"
                >
                  📥 MP3
                </button>
                {currentQuiz && (
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(true)}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all flex items-center gap-1 shadow-sm"
                    title="Passer le quiz synchronisé du jour"
                  >
                    <span>📝</span> Quiz
                  </button>
                )}
              </div>

              {/* Accordion pour lire le dialogue */}
              {currentAudioScript?.dialogue && currentAudioScript.dialogue.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDialogue(!showDialogue)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>{showDialogue ? "▲" : "▼"}</span>
                    {showDialogue ? "Masquer le script textuel" : "Afficher le dialogue écrit"}
                  </button>

                  {showDialogue && (
                    <div className="mt-2 p-2.5 bg-slate-900 rounded-lg max-h-48 overflow-y-auto space-y-2 text-[11px] border border-slate-800 custom-scrollbar">
                      {currentAudioScript.dialogue.map((line: any, li: number) => (
                        <div key={li} className="space-y-0.5">
                          <span
                            className={`font-bold ${
                              line.speaker === "Socrate" ? "text-indigo-400" : "text-amber-400"
                            }`}
                          >
                            {line.speaker} :
                          </span>
                          <p className="text-slate-300 pl-2 leading-relaxed">{line.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. LIEN VERS LE NOTEBOOK GOOGLE */}
          <a
            href={currentModule.notebookUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!currentModule.notebookUrl) e.preventDefault();
              stopAllAudio();
              if (onInteract) onInteract();
            }}
            className="w-full text-xs bg-slate-950/60 hover:bg-indigo-600 text-indigo-300 hover:text-white py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-2 border border-slate-800 hover:border-indigo-500 relative z-10"
          >
            <span>📓</span> Ouvrir le Notebook de la Semaine
          </a>

          {/* Raccourcis Socratiques */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/50 relative z-10">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Questions rapides
            </span>

            <button
              type="button"
              onClick={() => handleQuickAction("Pourquoi ce concept a-t-il été inventé ? Quelle est l'intuition profonde ?")}
              className="text-xs bg-slate-950/50 hover:bg-indigo-600 text-slate-300 hover:text-white py-1.5 px-3 rounded-lg transition-all text-left flex items-center gap-2 border border-slate-800"
            >
              <span>🤔</span> L'intuition derrière ce concept
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction("Peux-tu me donner un exemple concret de code commenté pas à pas ?")}
              className="text-xs bg-slate-950/50 hover:bg-indigo-600 text-slate-300 hover:text-white py-1.5 px-3 rounded-lg transition-all text-left flex items-center gap-2 border border-slate-800"
            >
              <span>💻</span> Un exemple de code pas à pas
            </button>
          </div>
        </div>

        {/* --- SECTION CHAT EN DIRECT AVEC LE TUTEUR SOCRATE --- */}
        <div className="flex-1 flex flex-col min-h-64 bg-slate-900/60 rounded-xl border border-slate-800 p-3">
          <div className="flex-1 overflow-y-auto mb-3 pr-2 space-y-4 custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[85%] ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-indigo-400 border border-slate-700"
                    }`}
                  >
                    {m.role === "user" ? "U" : "🏛️"}
                  </div>

                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <div className="my-2 rounded-lg overflow-hidden border border-slate-800">
                              <SyntaxHighlighter
                                language={match[1]}
                                style={vscDarkPlus as any}
                                customStyle={{
                                  margin: 0,
                                  fontSize: "0.75rem",
                                  backgroundColor: "#020617",
                                }}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono text-[11px]" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Bouton de lecture audio de la réponse de Socrate */}
                {m.role === "model" && m.text && (
                  <button
                    type="button"
                    onClick={() => toggleSpeech(m.text, idx)}
                    className="mt-1 ml-9 text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition"
                  >
                    <span>{speakingIdx === idx ? "⏹️" : "🔊"}</span>
                    {speakingIdx === idx ? "Arrêter la voix" : "Écouter la réponse"}
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire de saisie & micro */}
          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={startListening}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Dictée vocale"
            >
              🎤
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question à Socrate..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-md shadow-indigo-600/30"
            >
              {isLoading ? "..." : "Envoyer"}
            </button>
          </form>
        </div>

      </aside>

      {/* MODAL DU QUIZ INTERACTIF */}
      <InteractiveQuizModal
        quiz={currentQuiz}
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
      />
    </>
  );
}