"use client";

import { useState } from "react";
import CourseAssistantSidebar from "@/components/CourseAssistantSidebar";
import { CS50_MODULES } from "@/config/courseModules";

export default function CoursePage() {
  const [activeModuleId, setActiveModuleId] = useState(0);
  const activeModule = CS50_MODULES.find((m) => m.id === activeModuleId) || CS50_MODULES[0];

  // Fonction magique pour transformer n'importe quel lien YouTube en URL embed propre
  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    // Si c'est déjà un lien embed
    if (url.includes("/embed/")) return url;
    // Sinon, on extrait l'ID de la vidéo du lien watch?v=...
    const match = url.match(/(?:v=|\/embed\/|\/v\/|youtu\.be\/)([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}` : url;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      
      {/* MENU DE NAVIGATION LATÉRAL GAUCHE */}
      <nav className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col z-10 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Savoir IA</h1>
          <p className="text-xs text-indigo-400 mt-1 font-medium">CS50x Francophone</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {CS50_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModuleId(mod.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeModuleId === mod.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {mod.title}
            </button>
          ))}
        </div>
      </nav>

      {/* ZONE CENTRALE : LECTEUR VIDÉO INTÉGRÉ & RÉSUMÉ */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center relative overflow-hidden">
          
          {/* Effet lumineux d'arrière-plan */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* En-tête : Titre et Module */}
          <div className="w-full flex justify-between items-center mb-4">
            <span className="bg-indigo-600/25 text-indigo-300 text-xs font-semibold px-3.5 py-1 rounded-full border border-indigo-500/30 shadow-sm">
              Module {activeModule.id}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {activeModule.title}
            </h2>
          </div>

          {/* LECTEUR VIDÉO INTÉGRÉ (Iframe sécurisé anti-erreur 153) */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner mb-4 relative">
            {activeModule.videoUrl ? (
              <iframe
                src={getEmbedUrl(activeModule.videoUrl)}
                title={activeModule.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Vidéo non disponible pour ce module
              </div>
            )}
          </div>

          {/* Résumé de la vidéo en bas du lecteur */}
          <div className="w-full bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 text-left">
            <h4 className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
              <span>📺</span> Résumé de la vidéo principale
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeModule.videoSummary || "Aucun résumé disponible."}
            </p>
          </div>

        </div>
      </main>

      {/* BARRE LATÉRALE DROITE : TUTEUR SOCRATE + PODCAST + NOTEBOOK */}
      <CourseAssistantSidebar moduleId={activeModuleId} />

    </div>
  );
}