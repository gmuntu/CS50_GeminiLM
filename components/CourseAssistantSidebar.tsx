"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CS50_MODULES } from "@/config/courseModules";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Message {
  role: "user" | "model";
  text: string;
}

interface Props {
  moduleId: number;
  onInteract?: () => void;
}

export default function CourseAssistantSidebar({ moduleId, onInteract }: Props) {
  const currentModule = CS50_MODULES[moduleId] ?? CS50_MODULES[0];

  // État pour savoir quelle vidéo est active (par défaut la vidéo YouTube principale du module)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(currentModule.videoUrl);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Bonjour ! Je suis Socrate, ton tuteur pour le module : **${
        currentModule?.title ?? "ce cours"
      }**. Comment puis-je t'aider à réfléchir sur ton code ou tes concepts aujourd'hui ?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Met à jour la vidéo active lorsqu'on change de module (de semaine)
  useEffect(() => {
    setActiveVideoUrl(currentModule.videoUrl);
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
  }, [currentAudio]);

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
      console.error("Erreur lors de la génération de la réponse :", err);

      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        const partialText =
          lastMsg && lastMsg.role === "model" ? lastMsg.text : "";
        updated[updated.length - 1] = {
          role: "model",
          text: partialText
            ? `${partialText}\n\n⚠️ *Une erreur est survenue lors de la génération.*`
            : "⚠️ Une erreur est survenue.",
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
      alert(
        "Désolé, votre navigateur ne supporte pas la reconnaissance vocale. Essayez Chrome ou Edge."
      );
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

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          console.warn("Aucune parole détectée, réessaie de parler.");
        } else {
          console.error("Erreur reconnaissance vocale :", event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (error) {
      console.error("Impossible de démarrer la reconnaissance vocale :", error);
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
      .replace(/```[\s\S]*?```/g, " [Exemple de code affiché à l'écran] ")
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
        throw new Error(data.error || "Erreur serveur TTS");
      }

      const audio = new Audio("data:audio/mp3;base64," + data.audioContent);

      audio.onended = () => {
        setSpeakingIdx(null);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (error: any) {
      console.error("Erreur de synthèse vocale :", error);
      alert(error.message || "Impossible de générer la voix.");
      setSpeakingIdx(null);
    }
  };

  const handleQuickAction = (text: string) => {
    stopAllAudio();
    if (onInteract) onInteract();
    setInput(text);
  };

  return (
    <aside className="w-96 flex flex-col h-screen bg-slate-950 text-slate-100 p-4 shadow-2xl">
      <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* --- LECTEUR VIDÉO DYNAMIQUE (YouTube ou Fichier MP4 local) --- */}
        {activeVideoUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-md border border-slate-800/80 z-10">
            {activeVideoUrl.includes("youtube.com") || activeVideoUrl.includes("youtu.be") ? (
              <iframe
                src={activeVideoUrl}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={activeVideoUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            )}
          </div>
        )}

        {/* 1. Résumé de la vidéo principale (CLIQUABLE pour lancer la vidéo locale via 📺) */}
        <div 
          onClick={() => {
            if (currentModule.videoSummaryUrl) {
              setActiveVideoUrl(currentModule.videoSummaryUrl);
            }
          }}
          className={`p-2.5 rounded-lg border relative z-10 transition cursor-pointer ${
            currentModule.videoSummaryUrl 
              ? "bg-slate-950/50 border-slate-800/80 hover:bg-slate-800 hover:border-indigo-500/50" 
              : "bg-slate-950/50 border-slate-800/80 opacity-80"
          }`}
          title={currentModule.videoSummaryUrl ? "Cliquer pour lancer la vidéo de résumé" : ""}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">📺</span>
            <h4 className="font-semibold text-xs text-indigo-300">Résumé de la vidéo principale</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentModule.videoSummary || "Résumé en cours de chargement pour ce module..."}
          </p>
        </div>

        {/* 2. Podcast audio : Synthèse globale des sources */}
        <div className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60 relative z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">🎧</span>
            <h4 className="font-semibold text-xs text-slate-200">Podcast (Synthèse des sources)</h4>
          </div>
          <audio
            controls
            controlsList="nodownload"
            className="w-full h-8 rounded-lg custom-audio"
            src={currentModule.podcastUrl || "/podcasts/semaine0.mp3"}
            key={`podcast-${currentModule.id}`}
          />
        </div>

        {/* 3. Lien vers le Notebook Google Colab */}
        <a
          href={currentModule.notebookUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!currentModule.notebookUrl) e.preventDefault();
            stopAllAudio();
            if (onInteract) onInteract();
          }}
          className="w-full text-xs bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-2 border border-indigo-500/30 shadow-sm relative z-10"
        >
          <span>📓</span> Ouvrir le Notebook du module
        </a>

        {/* Raccourcis d'interaction avec Socrate */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/50 relative z-10">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Interagir avec le cours
          </span>

          <button
            type="button"
            onClick={() => handleQuickAction("J'ai besoin d'une clarification sur ce concept technique.")}
            className="text-xs bg-slate-950/50 hover:bg-indigo-600 text-slate-300 hover:text-white py-1.5 px-3 rounded-lg transition-all text-left flex items-center gap-2 border border-slate-800 hover:border-indigo-500"
          >
            <span>🤔</span> Demander une clarification
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction("Peux-tu me donner un exemple concret en code ?")}
            className="text-xs bg-slate-950/50 hover:bg-indigo-600 text-slate-300 hover:text-white py-1.5 px-3 rounded-lg transition-all text-left flex items-center gap-2 border border-slate-800 hover:border-indigo-500"
          >
            <span>💻</span> Obtenir un exemple de code
          </button>
        </div>
      </div>

      {/* Section Chat / Tuteur */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 rounded-xl border border-slate-800 p-3">
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
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                  }`}
                >
                  <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-md my-2 text-xs"
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="bg-slate-900 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono"
                              {...props}
                            >
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

                {m.role === "model" && m.text.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleSpeech(m.text, idx)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-indigo-500 text-slate-400 hover:text-white transition-all border border-slate-700/50 flex-shrink-0 shadow-sm"
                    title={
                      speakingIdx === idx
                        ? "Arrêter la lecture"
                        : "Lire à haute voix"
                    }
                  >
                    {speakingIdx === idx ? "⏹️" : "🔊"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1 pl-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-300" />
              <span className="ml-1 text-[11px] text-indigo-300">
                Socrate analyse...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="mt-2 pt-3 border-t border-slate-800 flex gap-2 items-center"
        >
          <button
            type="button"
            onClick={startListening}
            disabled={isLoading}
            className={`flex items-center justify-center p-2 rounded-lg transition-all border ${
              isListening
                ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                : "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            }`}
            title="Parler à Socrate"
          >
            <span className="text-lg">🎙️</span>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening ? "Je vous écoute..." : "Pose ta question..."
            }
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner disabled:opacity-50"
            disabled={isLoading || isListening}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-md"
          >
            Envoyer
          </button>
        </form>
      </div>
    </aside>
  );
}