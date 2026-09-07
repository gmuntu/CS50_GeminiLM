import { prisma } from '@/lib/prisma';
import { CS50_CANONICAL_CURRICULUM, getCourseSource } from '@/lib/course-sources';
import { generateVideoSummary, VideoSummaryPayload } from '@/lib/gemini/video-summary.service';
import {
  generateSingleAudioScript,
  generateWeeklyAudioScripts,
  AudioScriptPayload,
  DayOfWeekType,
} from '@/lib/gemini/audio-script.service';
import { generateSingleQuiz, generateWeeklyQuizzes, QuizPayload } from '@/lib/gemini/quiz.service';
import { DayOfWeek } from '@prisma/client';

/**
 * Garantit qu'un module de cours existe en base de données avec ses métadonnées officielles.
 */
export async function ensureCourseModule(moduleId: number) {
  const canonical = CS50_CANONICAL_CURRICULUM[moduleId] || CS50_CANONICAL_CURRICULUM[0];

  return await prisma.courseModule.upsert({
    where: { id: canonical.id },
    update: {
      title: canonical.title,
      slug: canonical.slug,
      description: canonical.canonicalSummary,
      videoUrl: canonical.videoUrl,
    },
    create: {
      id: canonical.id,
      title: canonical.title,
      slug: canonical.slug,
      description: canonical.canonicalSummary,
      videoUrl: canonical.videoUrl,
    },
  });
}

/**
 * Persiste ou met à jour le résumé vidéo structuré d'un module en base de données.
 */
export async function saveVideoSummary(moduleId: number, data: VideoSummaryPayload) {
  await ensureCourseModule(moduleId);

  return await prisma.videoSummary.upsert({
    where: { moduleId },
    update: {
      title: data.title,
      overview: data.overview,
      keyConcepts: data.keyConcepts as any,
      timelineBreakdown: data.timelineBreakdown as any,
      codeExamples: (data.codeExamples || []) as any,
      pedagogicalTakeaway: data.pedagogicalTakeaway,
      fullMarkdown: data.fullMarkdown,
      updatedAt: new Date(),
    },
    create: {
      moduleId,
      title: data.title,
      overview: data.overview,
      keyConcepts: data.keyConcepts as any,
      timelineBreakdown: data.timelineBreakdown as any,
      codeExamples: (data.codeExamples || []) as any,
      pedagogicalTakeaway: data.pedagogicalTakeaway,
      fullMarkdown: data.fullMarkdown,
    },
  });
}

/**
 * Persiste ou met à jour un script audio Socratique pour un jour donné.
 */
export async function saveAudioScript(
  moduleId: number,
  data: AudioScriptPayload,
  audioUrl?: string
) {
  await ensureCourseModule(moduleId);
  const dayEnum = data.dayOfWeek as DayOfWeek;

  return await prisma.audioScript.upsert({
    where: {
      moduleId_dayOfWeek: {
        moduleId,
        dayOfWeek: dayEnum,
      },
    },
    update: {
      title: data.title,
      pedagogicalObjective: data.pedagogicalObjective,
      targetDurationMinutes: data.targetDurationMinutes || 5,
      dialogue: data.dialogue as any,
      cleanTtsText: data.cleanTtsText,
      audioUrl: audioUrl || undefined,
      updatedAt: new Date(),
    },
    create: {
      moduleId,
      dayOfWeek: dayEnum,
      title: data.title,
      pedagogicalObjective: data.pedagogicalObjective,
      targetDurationMinutes: data.targetDurationMinutes || 5,
      dialogue: data.dialogue as any,
      cleanTtsText: data.cleanTtsText,
      audioUrl: audioUrl || null,
    },
  });
}

/**
 * Persiste ou met à jour un Quiz et ses questions associées.
 */
export async function saveQuiz(
  moduleId: number,
  data: QuizPayload,
  audioScriptId?: string
) {
  await ensureCourseModule(moduleId);
  const dayEnum = data.dayOfWeek as DayOfWeek;

  // Création ou mise à jour de l'en-tête du Quiz
  const quiz = await prisma.quiz.upsert({
    where: {
      moduleId_dayOfWeek: {
        moduleId,
        dayOfWeek: dayEnum,
      },
    },
    update: {
      title: data.title,
      description: data.description,
      audioScriptId: audioScriptId || undefined,
      updatedAt: new Date(),
    },
    create: {
      moduleId,
      dayOfWeek: dayEnum,
      title: data.title,
      description: data.description,
      audioScriptId: audioScriptId || null,
    },
  });

  // Remplacement atomique des questions pour garantir la cohérence
  await prisma.quizQuestion.deleteMany({
    where: { quizId: quiz.id },
  });

  if (data.questions && data.questions.length > 0) {
    await prisma.quizQuestion.createMany({
      data: data.questions.map((q, idx) => ({
        quizId: quiz.id,
        order: q.order ?? idx + 1,
        question: q.question,
        options: q.options as any,
        correctOption: q.correctOption,
        explanation: q.explanation,
        conceptTested: q.conceptTested || 'Notion CS50',
      })),
    });
  }

  return await prisma.quiz.findUnique({
    where: { id: quiz.id },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
}

/**
 * Génère et enregistre le résumé vidéo complet pour une semaine.
 */
export async function generateAndSaveVideoSummary(moduleId: number) {
  const payload = await generateVideoSummary(moduleId);
  const saved = await saveVideoSummary(moduleId, payload);
  return { payload, saved };
}

/**
 * Génère et enregistre les 3 scripts audio Socratiques de la semaine complète (Lundi, Mercredi, Vendredi).
 */
export async function generateAndSaveWeeklyAudioScripts(moduleId: number) {
  const scripts = await generateWeeklyAudioScripts(moduleId);
  const savedMonday = await saveAudioScript(moduleId, scripts.MONDAY);
  const savedWednesday = await saveAudioScript(moduleId, scripts.WEDNESDAY);
  const savedFriday = await saveAudioScript(moduleId, scripts.FRIDAY);

  return {
    MONDAY: { payload: scripts.MONDAY, saved: savedMonday },
    WEDNESDAY: { payload: scripts.WEDNESDAY, saved: savedWednesday },
    FRIDAY: { payload: scripts.FRIDAY, saved: savedFriday },
  };
}

/**
 * Génère et enregistre les scripts audio Socratiques (pour un jour ou toute la semaine).
 */
export async function generateAndSaveAudioScripts(
  moduleId: number,
  dayOfWeek?: DayOfWeekType
) {
  if (dayOfWeek) {
    const payload = await generateSingleAudioScript(moduleId, dayOfWeek);
    const saved = await saveAudioScript(moduleId, payload);
    return { [dayOfWeek]: { payload, saved } };
  }

  return await generateAndSaveWeeklyAudioScripts(moduleId);
}

/**
 * Génère et enregistre les quiz synchronisés (pour un jour ou toute la semaine).
 */
export async function generateAndSaveQuizzes(
  moduleId: number,
  dayOfWeek?: DayOfWeekType,
  audioScriptMap?: Partial<Record<DayOfWeekType, string>>
) {
  if (dayOfWeek) {
    const payload = await generateSingleQuiz(moduleId, dayOfWeek, undefined);
    const audioScript = await prisma.audioScript.findUnique({
      where: { moduleId_dayOfWeek: { moduleId, dayOfWeek: dayOfWeek as DayOfWeek } },
    });
    const saved = await saveQuiz(moduleId, payload, audioScript?.id);
    return { [dayOfWeek]: { payload, saved } };
  }

  const quizzes = await generateWeeklyQuizzes(moduleId);

  // Recherche des scripts audio existants pour liaison de clé étrangère
  const existingAudioScripts = await prisma.audioScript.findMany({
    where: { moduleId },
  });
  const audioMap: Record<string, string> = {};
  for (const a of existingAudioScripts) {
    audioMap[a.dayOfWeek] = a.id;
  }

  const savedMonday = await saveQuiz(moduleId, quizzes.MONDAY, audioMap['MONDAY']);
  const savedWednesday = await saveQuiz(moduleId, quizzes.WEDNESDAY, audioMap['WEDNESDAY']);
  const savedFriday = await saveQuiz(moduleId, quizzes.FRIDAY, audioMap['FRIDAY']);

  return {
    MONDAY: { payload: quizzes.MONDAY, saved: savedMonday },
    WEDNESDAY: { payload: quizzes.WEDNESDAY, saved: savedWednesday },
    FRIDAY: { payload: quizzes.FRIDAY, saved: savedFriday },
  };
}

/**
 * Pipeline d'automatisation intégrale : génère la totalité du paquet pédagogique
 * pour une semaine (Résumé vidéo + 3 Scripts audio + 3 Quiz synchronisés) et persiste tout en BDD.
 */
export async function generateFullWeekPedagogy(moduleId: number) {
  console.log(`🚀 [PedagogyService] Démarrage de la génération intégrale pour la Semaine ${moduleId}...`);

  // 1. Génération et persistance du résumé vidéo
  console.log(`📺 Génération du Résumé Vidéo pour le Module ${moduleId}...`);
  const videoResult = await generateAndSaveVideoSummary(moduleId);

  // 2. Génération et persistance des 3 audios Socratiques (Lundi, Mercredi, Vendredi)
  console.log(`🎙️ Génération des 3 Audios Socratiques (Lundi, Mercredi, Vendredi)...`);
  const audioResults = await generateAndSaveWeeklyAudioScripts(moduleId);

  // 3. Génération et persistance des 3 quiz synchronisés
  console.log(`📝 Génération des 3 Quiz synchronisés...`);
  const audioScriptsMap: Record<DayOfWeekType, string> = {
    MONDAY: audioResults.MONDAY.saved.id,
    WEDNESDAY: audioResults.WEDNESDAY.saved.id,
    FRIDAY: audioResults.FRIDAY.saved.id,
  };

  const quizMondayPayload = await generateSingleQuiz(
    moduleId,
    'MONDAY',
    audioResults.MONDAY.payload.cleanTtsText
  );
  const quizWednesdayPayload = await generateSingleQuiz(
    moduleId,
    'WEDNESDAY',
    audioResults.WEDNESDAY.payload.cleanTtsText
  );
  const quizFridayPayload = await generateSingleQuiz(
    moduleId,
    'FRIDAY',
    audioResults.FRIDAY.payload.cleanTtsText
  );

  const savedQuizMonday = await saveQuiz(moduleId, quizMondayPayload, audioScriptsMap.MONDAY);
  const savedQuizWednesday = await saveQuiz(moduleId, quizWednesdayPayload, audioScriptsMap.WEDNESDAY);
  const savedQuizFriday = await saveQuiz(moduleId, quizFridayPayload, audioScriptsMap.FRIDAY);

  console.log(`✅ [PedagogyService] Semaine ${moduleId} entièrement générée et archivée en base !`);

  return {
    moduleId,
    videoSummary: videoResult.saved,
    audioScripts: {
      MONDAY: audioResults.MONDAY.saved,
      WEDNESDAY: audioResults.WEDNESDAY.saved,
      FRIDAY: audioResults.FRIDAY.saved,
    },
    quizzes: {
      MONDAY: savedQuizMonday,
      WEDNESDAY: savedQuizWednesday,
      FRIDAY: savedQuizFriday,
    },
  };
}

/**
 * Récupère le paquet pédagogique complet d'un module pour l'affichage frontend.
 */
export async function getModulePedagogy(moduleId: number) {
  const moduleData = await prisma.courseModule.findUnique({
    where: { id: moduleId },
    include: {
      videoSummary: true,
      audioScripts: {
        orderBy: { dayOfWeek: 'asc' },
      },
      quizzes: {
        orderBy: { dayOfWeek: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  return moduleData;
}

/**
 * Récupère la liste de tous les 11 modules avec l'état d'avancement de leurs contenus.
 */
export async function listModulesOverview() {
  const modules = await prisma.courseModule.findMany({
    orderBy: { id: 'asc' },
    include: {
      videoSummary: { select: { id: true, title: true, updatedAt: true } },
      audioScripts: { select: { id: true, dayOfWeek: true, title: true } },
      quizzes: { select: { id: true, dayOfWeek: true, title: true, _count: { select: { questions: true } } } },
    },
  });

  return modules;
}

/**
 * Évalue les réponses d'un étudiant à un quiz, calcule le score et archive la tentative.
 */
export async function submitQuizAttempt(params: {
  quizId: string;
  userId?: string | null;
  answers: Record<string, string>; // { [questionId]: "A" | "B" | "C" | "D" }
}) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: { questions: { orderBy: { order: 'asc' } } },
  });

  if (!quiz) {
    throw new Error(`Quiz non trouvé avec l'identifiant ${params.quizId}`);
  }

  let score = 0;
  const total = quiz.questions.length;

  const review = quiz.questions.map((q) => {
    const selectedOption = params.answers[q.id];
    const isCorrect = selectedOption === q.correctOption;
    if (isCorrect) score += 1;

    return {
      questionId: q.id,
      question: q.question,
      selectedOption: selectedOption || null,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
      conceptTested: q.conceptTested,
    };
  });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 70;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: params.userId || null,
      answers: params.answers as any,
      score,
      total,
      passed,
    },
  });

  return {
    attemptId: attempt.id,
    score,
    total,
    percentage,
    passed,
    review,
  };
}
