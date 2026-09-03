"use client";

import { useState } from "react";
import CourseAssistantSidebar from "@/components/CourseAssistantSidebar";
import { CS50_MODULES } from "@/config/courseModules";

export default function CoursePage() {
  // L'état qui mémorise la semaine actuellement sélectionnée par l'étudiant
  const [activeModuleId, setActiveModuleId] = useState(0);
  
  // On récupère les infos du module actif
  const activeModule = CS50_MODULES.find(m => m.id === activeModuleId) || CS50_MODULES[0];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      
      {/* 1. MENU DE NAVIGATION (COLONNE GAUCHE) */}
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
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {mod.title}
            </button>
          ))}
        </div>
      </nav>

      {/* 2. CONTENU DU COURS (COLONNE CENTRALE) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-4xl mx-auto p-8">
          
          <header className="mb-8 border-b border-slate-800 pb-6">
            <div className="inline-block px-3 py-1 bg-slate-800 text-indigo-300 rounded-full text-xs font-semibold mb-3">
              Module {activeModule.id}
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {activeModule.title}
            </h1>
          </header>

          {/* Lecteur Vidéo Dynamique */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-12 border border-slate-800">
            <iframe 
             key={activeModule.id}
             width="100%"
             height="100%"
             src={`https://www.youtube.com/embed/${activeModule.youtubeId}`}
             title={activeModule.title}
             frameBorder="0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen>
            </iframe>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Espace de travail</h2>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">
                Visionnez la vidéo de cours ci-dessus. Si vous êtes bloqué sur un concept ou un problème de la {activeModule.title.split(' : ')[0].toLowerCase()}, posez votre question à Socrate dans la barre latérale.
              </p>
            </div>
          </div>
          
        </div>
      </main>

      {/* 3. TUTEUR IA (COLONNE DROITE) */}
      <div className="w-96 border-l border-slate-800 bg-slate-900 shadow-2xl z-20 flex flex-col">
        {/* L'astuce React : la clé "key" force la sidebar à se recharger quand on change de module */}
        <CourseAssistantSidebar key={activeModule.id} moduleId={activeModule.id} />
      </div>
      
    </div>
  );
}