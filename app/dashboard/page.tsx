'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = () => {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProgress(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleReset = async (moduleId?: number) => {
    if (!confirm(moduleId !== undefined ? "Êtes-vous sûr de vouloir réinitialiser la progression de ce module ?" : "Êtes-vous sûr de vouloir réinitialiser TOUTE votre progression ?")) return;
    
    setLoading(true);
    try {
      await fetch('/api/progress/reset', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId })
      });
      loadProgress();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-pulse text-xl">Chargement de votre progression...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-xl text-red-500">Erreur lors du chargement des données.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Tableau de bord
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Suivez votre progression dans le cursus CS50x</p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-4">
            <button
              onClick={() => handleReset()}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg text-xs sm:text-sm font-medium transition text-center"
            >
              Tout réinitialiser
            </button>
            <Link
              href="/"
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm font-medium transition text-center"
            >
              Retour aux cours
            </Link>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Modules complétés</h3>
            <div className="text-3xl sm:text-4xl font-bold text-white">
              {progress.modulesCompleted} <span className="text-base sm:text-lg text-gray-500 font-normal">/ {progress.totalModules}</span>
            </div>
            <div className="mt-3 sm:mt-4 w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${progress.completionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6">
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Score moyen global</h3>
            <div className="text-3xl sm:text-4xl font-bold text-green-400">
              {progress.globalAverageScore}%
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 flex flex-col justify-center sm:col-span-2 md:col-span-1">
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Statut</h3>
            <div className="text-lg sm:text-xl font-medium text-purple-400">
              {progress.completionPercentage === 100 ? 'Diplômé CS50 ! 🎓' : 'En cours d\'apprentissage 🚀'}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Détail par semaine</h2>
          
          {Object.values(progress.modules).map((mod: any) => (
            <div key={mod.moduleId} className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-gray-700 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${
                    mod.moduleStatus === 'COMPLETED' ? 'bg-green-500' : 
                    mod.moduleStatus === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}></div>
                  <h3 className="font-medium text-base sm:text-lg truncate">{mod.title}</h3>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
                  {mod.moduleStatus !== 'NOT_STARTED' && (
                    <button 
                      onClick={() => handleReset(mod.moduleId)}
                      className="text-xs text-slate-400 hover:text-red-400 transition underline"
                    >
                      Réinitialiser
                    </button>
                  )}
                  <div className="text-xs sm:text-sm font-medium px-2.5 py-1 sm:px-3 sm:py-1 bg-gray-800 rounded-full shrink-0">
                    Moyenne : <span className={mod.averageScore >= 70 ? 'text-green-400' : 'text-gray-300'}>{mod.averageScore}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {['MONDAY', 'WEDNESDAY', 'FRIDAY'].map(day => {
                  const q = mod.quizzes[day];
                  const dayName = day === 'MONDAY' ? 'Lundi' : day === 'WEDNESDAY' ? 'Mercredi' : 'Vendredi';
                  
                  return (
                    <div key={day} className="bg-gray-950 rounded-lg p-3 sm:p-4 border border-gray-800/50 flex flex-col justify-between space-y-1.5 sm:space-y-2">
                      <div className="text-xs sm:text-sm text-gray-400 font-medium">{dayName}</div>
                      
                      {q.status === 'NOT_STARTED' ? (
                        <div className="text-gray-500 text-xs sm:text-sm">Non commencé</div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm font-bold ${q.status === 'PASSED' ? 'text-green-500' : 'text-red-400'}`}>
                            {q.status === 'PASSED' ? 'Validé' : 'Échoué'}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-gray-300">
                            {q.percentage}% ({q.bestScore}/{q.total})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
