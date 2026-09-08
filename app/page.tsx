"use client";

import { useState, useEffect } from "react";
import CourseAssistantSidebar from "@/components/CourseAssistantSidebar";
import { CS50_MODULES } from "@/config/courseModules";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface VideoSummaryData {
  id: string;
  title: string;
  overview: string;
  keyConcepts: Array<{ term: string; definition: string; importance: string }>;
  timelineBreakdown: Array<{ timestamp?: string; title: string; description: string; keyPoints: string[] }>;
  codeExamples: Array<{ language: string; title: string; code: string; explanation: string }>;
  pedagogicalTakeaway: string;
  fullMarkdown: string;
}

export default function CoursePage() {
  const [activeModuleId, setActiveModuleId] = useState(0);
  const activeModule = CS50_MODULES.find((m) => m.id === activeModuleId) || CS50_MODULES[0];

  const [activeTab, setActiveTab] = useState<"markdown" | "concepts" | "timeline" | "code">("markdown");
  const [modulePayload, setModulePayload] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsg, setGenerationMsg] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Charge les données pédagogiques du module sélectionné
  useEffect(() => {
    let isMounted = true;
    async function loadModule() {
      setIsLoadingContent(true);
      try {
        const res = await fetch(`/api/content/modules/${activeModuleId}`);
        const json = await res.json();
        if (isMounted && json.success) {
          setModulePayload(json.data);
        }
      } catch (err) {
        console.error("Erreur chargement module :", err);
      } finally {
        if (isMounted) setIsLoadingContent(false);
      }
    }
    loadModule();
    return () => {
      isMounted = false;
    };
  }, [activeModuleId]);

  // Déclenche la génération automatique via l'API Gemini
  const handleGenerateModule = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationMsg("Génération en cours avec Gemini...");

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: activeModuleId, type: "all" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur de génération.");
      }

      setGenerationMsg("✅ Contenus générés et archivés !");
      // Recharger les données du module
      const refresh = await fetch(`/api/content/modules/${activeModuleId}`);
      const refreshJson = await refresh.json();
      if (refreshJson.success) {
        setModulePayload(refreshJson.data);
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de la génération.");
      setGenerationMsg(null);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationMsg(null), 4000);
    }
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("/embed/")) {
      return url.includes("playsinline=1") ? url : `${url}${url.includes("?") ? "&" : "?"}playsinline=1`;
    }
    const match = url.match(/(?:v=|\/embed\/|\/v\/|youtu\.be\/)([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}` : url;
  };

  const videoSummary: VideoSummaryData | null = modulePayload?.videoSummary || null;

  return (
    <div className="flex flex-col lg:flex-row h-screen h-[100dvh] bg-slate-950 text-slate-300 overflow-hidden font-sans relative">
      
      {/* BARRE SUPÉRIEURE MOBILE AVEC SAFE-AREA POUR IPHONE (ENCOCHE / DYNAMIC ISLAND) */}
      <header className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 bg-slate-900 border-b border-slate-800 shrink-0 z-30 lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center"
            aria-label="Ouvrir le menu des semaines"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Savoir IA</h1>
            <span className="text-[10px] text-indigo-400 font-medium">Semaine {activeModule.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            title="Progression"
          >
            📊
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <span>🎙️</span>
            <span>Socrate</span>
          </button>
        </div>
      </header>

      {/* OVERLAY SOMBRE LORSQUE LE MENU MOBILE EST OUVERT */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* MENU DE NAVIGATION LATÉRAL GAUCHE (TIROIR COULISSANT MOBILE / FIXE DESKTOP AVEC SAFE-AREA IPHONE) */}
      {!isFocusMode && (
        <nav
          className={`
            fixed top-0 left-0 z-50 h-screen h-[100dvh] w-72 sm:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out overscroll-contain
            lg:static lg:translate-x-0 lg:z-10 lg:h-full lg:w-64 lg:shadow-xl lg:shrink-0
            ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${!isMobileNavOpen ? "hidden lg:flex" : "flex"}
          `}
        >
          <div className="p-5 sm:p-6 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] border-b border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Savoir IA</h1>
              <p className="text-xs text-indigo-400 mt-0.5 font-medium">CS50x Francophone</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition lg:hidden"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>
          
          <div className="px-5 pt-3">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileNavOpen(false)}
              className="block w-full text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition"
            >
              📊 Ma Progression
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] space-y-1.5 sm:space-y-2 custom-scrollbar">
            {CS50_MODULES.map((mod) => (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveModuleId(mod.id);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                  activeModuleId === mod.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {mod.title}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ZONE CENTRALE : LECTEUR VIDÉO & GRANDS RÉSUMÉS PÉDAGOGIQUES */}
      <main className="flex-1 flex flex-col items-center p-3 sm:p-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-6 bg-slate-950 overflow-y-auto custom-scrollbar w-full min-w-0">
        <div className="w-full max-w-4xl space-y-5 sm:space-y-6">
          
          {/* En-tête du Module avec Action de Génération */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-600/25 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-indigo-500/30">
                  Semaine {activeModule.id}
                </span>
                {videoSummary && (
                  <span className="bg-emerald-600/20 text-emerald-300 text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    ✓ Contenus IA synchronisés
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {activeModule.title}
              </h2>
            </div>

            {/* Bouton Génération / Statut & Focus Mode */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {generationMsg && (
                <span className="text-xs text-indigo-300 font-medium animate-pulse">
                  {generationMsg}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow transition flex items-center gap-1.5"
                title={isFocusMode ? "Quitter le mode focus" : "Passer en mode focus"}
              >
                {isFocusMode ? "🔙 Quitter Focus" : "🔍 Mode Focus"}
              </button>
              <button
                type="button"
                onClick={handleGenerateModule}
                disabled={isGenerating}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                title="Génère ou met à jour les résumés, audios et quiz avec Google Gemini"
              >
                {isGenerating ? (
                  <span className="animate-spin text-sm">↻</span>
                ) : (
                  "⚡"
                )}
                {isGenerating ? "Génération..." : videoSummary ? "Régénérer avec l'IA" : "Générer les contenus"}
              </button>
            </div>
          </div>

          {/* Lecteur Vidéo (YouTube Iframe) */}
          <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 shadow-inner overflow-hidden relative group">
            <iframe
              src={getEmbedUrl(activeModule.videoUrl)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          
          {/* Barre de navigation interne (Tabs avec défilement horizontal fluide sur mobile) */}
          <div className="overflow-x-auto scrollbar-none flex gap-1.5 sm:gap-2 pt-2 border-b border-slate-800/60 pb-3 max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab("markdown")}
                className={`px-3 py-1.5 sm:px-3.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === "markdown"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                📖 Résumé Magistral
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("concepts")}
                className={`px-3 py-1.5 sm:px-3.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === "concepts"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                💡 Concepts Clés {videoSummary?.keyConcepts?.length ? `(${videoSummary.keyConcepts.length})` : ""}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`px-3 py-1.5 sm:px-3.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === "timeline"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                ⏱️ Découpage Vidéo
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1.5 sm:px-3.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === "code"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                💻 Extraits de Code
              </button>
            </div>

            {/* Contenu des onglets */}
            {isLoadingContent ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Chargement des contenus pédagogiques...
              </div>
            ) : !videoSummary ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  {activeModule.videoSummary || "Aucun résumé structuré disponible pour ce module."}
                </p>
                <button
                  type="button"
                  onClick={handleGenerateModule}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition"
                >
                  ⚡ Générer le résumé structuré avec Gemini
                </button>
              </div>
            ) : (
              <div className="pt-2">
                
                {/* 1. Onglet Markdown Complet */}
                {activeTab === "markdown" && (
                  <div className="prose prose-invert prose-indigo max-w-none text-xs leading-relaxed space-y-4 text-slate-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {videoSummary.fullMarkdown || videoSummary.overview}
                    </ReactMarkdown>
                  </div>
                )}

                {/* 2. Onglet Concepts Clés */}
                {activeTab === "concepts" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoSummary.keyConcepts?.map((c, i) => (
                      <div
                        key={i}
                        className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2"
                      >
                        <h4 className="text-sm font-bold text-indigo-300">{c.term}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{c.definition}</p>
                        <div className="pt-2 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Pourquoi c'est capital :</span>
                          <p className="text-[11px] text-slate-400 italic">{c.importance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Onglet Découpage Vidéo */}
                {activeTab === "timeline" && (
                  <div className="space-y-3">
                    {videoSummary.timelineBreakdown?.map((item, i) => (
                      <div
                        key={i}
                        className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex gap-4 items-start"
                      >
                        <span className="bg-indigo-600/30 text-indigo-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-indigo-500/30 shrink-0">
                          {item.timestamp || `Partie ${i + 1}`}
                        </span>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-xs font-bold text-white">{item.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                          {item.keyPoints && item.keyPoints.length > 0 && (
                            <ul className="list-disc list-inside text-[11px] text-slate-400 pt-1 space-y-0.5">
                              {item.keyPoints.map((pt, pti) => (
                                <li key={pti}>{pt}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Onglet Extraits de Code */}
                {activeTab === "code" && (
                  <div className="space-y-4">
                    {videoSummary.codeExamples && videoSummary.codeExamples.length > 0 ? (
                      videoSummary.codeExamples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-indigo-300">{ex.title}</h4>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400">
                              {ex.language}
                            </span>
                          </div>
                          <pre className="p-3 bg-black/60 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-900">
                            <code>{ex.code}</code>
                          </pre>
                          <p className="text-xs text-slate-400 leading-relaxed italic">{ex.explanation}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Consultez l'onglet Résumé Magistral pour voir l'ensemble du code source annoté.
                      </p>
                    )}
                  </div>
                )}

              </div>
            )}

        </div>
      </main>

      {/* BARRE LATÉRALE DROITE : SOCRATE + AUDIOS (LUNDI, MERCREDI, VENDREDI) + QUIZ */}
      {!isFocusMode && (
        <CourseAssistantSidebar
          moduleId={activeModuleId}
          pedagogicalData={modulePayload}
          isOpenOnMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onContentUpdated={() => {
            fetch(`/api/content/modules/${activeModuleId}`)
              .then((r) => r.json())
              .then((d) => d.success && setModulePayload(d.data));
          }}
        />
      )}

      {/* Bouton Flottant (FAB) Mobile pour ouvrir Socrate & Quiz avec Safe Area iPhone (masqué quand le tiroir est ouvert) */}
      {!isFocusMode && !isMobileSidebarOpen && (
        <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-5 z-30 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-600/50 border border-indigo-400/30 font-semibold text-xs tracking-wide transition active:scale-95"
            aria-label="Ouvrir le tuteur Socrate et les quiz"
          >
            <span className="text-base">🎙️</span>
            <span>Socrate & Quiz</span>
          </button>
        </div>
      )}

    </div>
  );
}