import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CS50_CANONICAL_CURRICULUM } from '@/lib/course-sources';

export async function GET() {
  try {
    // Récupérer toutes les tentatives de quiz
    const attempts = await prisma.quizAttempt.findMany({
      include: {
        quiz: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Agréger par module et par jour
    const progressByModule: Record<number, any> = {};

    for (let i = 0; i <= 10; i++) {
      progressByModule[i] = {
        moduleId: i,
        title: CS50_CANONICAL_CURRICULUM[i]?.title || `Semaine ${i}`,
        quizzes: {
          MONDAY: { status: 'NOT_STARTED', bestScore: 0, total: 0 },
          WEDNESDAY: { status: 'NOT_STARTED', bestScore: 0, total: 0 },
          FRIDAY: { status: 'NOT_STARTED', bestScore: 0, total: 0 },
        },
        moduleStatus: 'NOT_STARTED', // NOT_STARTED, IN_PROGRESS, COMPLETED
        averageScore: 0
      };
    }

    // Calculer les meilleurs scores par quiz
    attempts.forEach(attempt => {
      if (!attempt.quiz) return;
      const modId = attempt.quiz.moduleId;
      const day = attempt.quiz.dayOfWeek as 'MONDAY' | 'WEDNESDAY' | 'FRIDAY';
      
      if (!progressByModule[modId]) return;
      
      const currentBest = progressByModule[modId].quizzes[day];
      
      const percentage = (attempt.score / attempt.total) * 100;
      
      if (currentBest.status === 'NOT_STARTED' || percentage > (currentBest.bestScore / currentBest.total) * 100 || isNaN(currentBest.bestScore / currentBest.total)) {
        progressByModule[modId].quizzes[day] = {
          status: attempt.passed ? 'PASSED' : 'FAILED',
          bestScore: attempt.score,
          total: attempt.total,
          percentage: Math.round(percentage)
        };
      }
    });

    // Mettre à jour le statut global du module
    let globalTotalScore = 0;
    let globalTotalQuestions = 0;
    let totalModulesCompleted = 0;

    Object.values(progressByModule).forEach(mod => {
      let passedQuizzes = 0;
      let totalQuizzes = 0;
      let modScore = 0;
      let modTotal = 0;

      ['MONDAY', 'WEDNESDAY', 'FRIDAY'].forEach(day => {
        const q = mod.quizzes[day];
        if (q.status !== 'NOT_STARTED') {
          totalQuizzes++;
          modScore += q.bestScore;
          modTotal += q.total;
          
          globalTotalScore += q.bestScore;
          globalTotalQuestions += q.total;

          if (q.status === 'PASSED') passedQuizzes++;
        }
      });

      if (totalQuizzes === 0) {
        mod.moduleStatus = 'NOT_STARTED';
      } else if (passedQuizzes === 3) {
        mod.moduleStatus = 'COMPLETED';
        totalModulesCompleted++;
      } else {
        mod.moduleStatus = 'IN_PROGRESS';
      }

      mod.averageScore = modTotal > 0 ? Math.round((modScore / modTotal) * 100) : 0;
    });

    const globalProgress = {
      modulesCompleted: totalModulesCompleted,
      totalModules: 11,
      completionPercentage: Math.round((totalModulesCompleted / 11) * 100),
      globalAverageScore: globalTotalQuestions > 0 ? Math.round((globalTotalScore / globalTotalQuestions) * 100) : 0,
      modules: progressByModule
    };

    return NextResponse.json({ success: true, data: globalProgress });
  } catch (error: any) {
    console.error("Erreur GET /api/progress:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
