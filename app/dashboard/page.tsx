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
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Tableau de bord
            </h1>
            <p className="text-gray-400 mt-2">Suivez votre progression dans le cursus CS50x</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleReset()} className="px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg text-sm font-medium transition">
              Tout réinitialiser
            </button>
            <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition">
              Retour aux cours
            </Link>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Modules complétés</h3>
            <div className="text-4xl font-bold text-white">
              {progress.modulesCompleted} <span className="text-lg text-gray-500 font-normal">/ {progress.totalModules}</span>
            </div>
            <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${progress.completionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Score moyen global</h3>
            <div className="text-4xl font-bold text-green-400">
              {progress.globalAverageScore}%
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Statut</h3>
            <div className="text-xl font-medium text-purple-400">
              {progress.completionPercentage === 100 ? 'Diplômé CS50 ! 🎓' : 'En cours d\'apprentissage 🚀'}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Détail par semaine</h2>
          
          {Object.values(progress.modules).map((mod: any) => (
            <div key={mod.moduleId} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    mod.moduleStatus === 'COMPLETED' ? 'bg-green-500' : 
                    mod.moduleStatus === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}></div>
                  <h3 className="font-medium text-lg">{mod.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  {mod.moduleStatus !== 'NOT_STARTED' && (
                    <button 
                      onClick={() => handleReset(mod.moduleId)}
                      className="text-xs text-slate-400 hover:text-red-400 transition underline"
                    >
                      Réinitialiser
                    </button>
                  )}
                  <div className="text-sm font-medium px-3 py-1 bg-gray-800 rounded-full">
                    Moyenne : <span className={mod.averageScore >= 70 ? 'text-green-400' : 'text-gray-300'}>{mod.averageScore}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['MONDAY', 'WEDNESDAY', 'FRIDAY'].map(day => {
                  const q = mod.quizzes[day];
                  const dayName = day === 'MONDAY' ? 'Lundi' : day === 'WEDNESDAY' ? 'Mercredi' : 'Vendredi';
                  
                  return (
                    <div key={day} className="bg-gray-950 rounded-lg p-4 border border-gray-800/50 flex flex-col justify-between">
                      <div className="text-sm text-gray-400 mb-2 font-medium">{dayName}</div>
                      
                      {q.status === 'NOT_STARTED' ? (
                        <div className="text-gray-500 text-sm">Non commencé</div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${q.status === 'PASSED' ? 'text-green-500' : 'text-red-400'}`}>
                            {q.status === 'PASSED' ? 'Validé' : 'Échoué'}
                          </span>
                          <span className="text-sm font-medium text-gray-300">
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
