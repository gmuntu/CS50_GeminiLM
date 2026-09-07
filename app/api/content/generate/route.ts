import { NextRequest, NextResponse } from 'next/server';
import {
  generateAndSaveVideoSummary,
  generateAndSaveAudioScripts,
  generateAndSaveQuizzes,
  generateFullWeekPedagogy,
} from '@/lib/services/pedagogy.service';
import { generateVideoSummary } from '@/lib/gemini/video-summary.service';
import { generateSingleAudioScript, generateWeeklyAudioScripts, DayOfWeekType } from '@/lib/gemini/audio-script.service';
import { generateSingleQuiz, generateWeeklyQuizzes } from '@/lib/gemini/quiz.service';

/**
 * POST /api/content/generate
 * Automatise la génération par l'IA Gemini et la persistance en base de données.
 *
 * Paramètres du corps JSON :
 * - moduleId : number (0 à 10, obligatoire)
 * - type : 'all' | 'video' | 'audio' | 'quiz' (optionnel, défaut: 'all')
 * - day : 'MONDAY' | 'WEDNESDAY' | 'FRIDAY' (optionnel, pour cibler une session spécifique)
 * - previewOnly : boolean (optionnel, génère sans enregistrer en BDD si true)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moduleId, type = 'all', day, previewOnly = false } = body;

    if (moduleId === undefined || moduleId === null || isNaN(Number(moduleId))) {
      return NextResponse.json(
        { success: false, error: "Le paramètre 'moduleId' (entier entre 0 et 10) est obligatoire." },
        { status: 400 }
      );
    }

    const modId = Number(moduleId);
    if (modId < 0 || modId > 10) {
      return NextResponse.json(
        { success: false, error: "Le 'moduleId' doit être compris entre 0 et 10 (Semaines CS50x)." },
        { status: 400 }
      );
    }

    // MODE PRÉVISUALISATION SANS PERSISTANCE BDD
    if (previewOnly) {
      if (type === 'video') {
        const result = await generateVideoSummary(modId);
        return NextResponse.json({ success: true, mode: 'preview', type: 'video', moduleId: modId, data: result });
      }

      if (type === 'audio') {
        const result = day
          ? await generateSingleAudioScript(modId, day as DayOfWeekType)
          : await generateWeeklyAudioScripts(modId);
        return NextResponse.json({ success: true, mode: 'preview', type: 'audio', moduleId: modId, data: result });
      }

      if (type === 'quiz') {
        const result = day
          ? await generateSingleQuiz(modId, day as DayOfWeekType)
          : await generateWeeklyQuizzes(modId);
        return NextResponse.json({ success: true, mode: 'preview', type: 'quiz', moduleId: modId, data: result });
      }

      // Par défaut pour 'all' en preview
      const [video, audio, quiz] = await Promise.all([
        generateVideoSummary(modId),
        generateWeeklyAudioScripts(modId),
        generateWeeklyQuizzes(modId),
      ]);
      return NextResponse.json({
        success: true,
        mode: 'preview',
        type: 'all',
        moduleId: modId,
        data: { videoSummary: video, audioScripts: audio, quizzes: quiz },
      });
    }

    // MODE COMPLET AVEC PERSISTANCE EN BASE DE DONNÉES (PRISMA / NEON)
    if (type === 'video') {
      const result = await generateAndSaveVideoSummary(modId);
      return NextResponse.json({
        success: true,
        type: 'video',
        moduleId: modId,
        message: `Résumé vidéo du module ${modId} généré et persisté en base de données.`,
        data: result.saved,
      });
    }

    if (type === 'audio') {
      const result = await generateAndSaveAudioScripts(modId, day as DayOfWeekType);
      return NextResponse.json({
        success: true,
        type: 'audio',
        moduleId: modId,
        day: day || 'ALL_WEEK',
        message: `Scripts audio du module ${modId} générés et persistés.`,
        data: result,
      });
    }

    if (type === 'quiz') {
      const result = await generateAndSaveQuizzes(modId, day as DayOfWeekType);
      return NextResponse.json({
        success: true,
        type: 'quiz',
        moduleId: modId,
        day: day || 'ALL_WEEK',
        message: `Quiz synchronisés du module ${modId} générés et persistés.`,
        data: result,
      });
    }

    // Type 'all' : Pipeline complet
    const fullResult = await generateFullWeekPedagogy(modId);
    return NextResponse.json({
      success: true,
      type: 'all',
      moduleId: modId,
      message: `Ensemble du paquet pédagogique (Vidéo, 3 Audios Socratiques, 3 Quiz) généré et archivé pour la Semaine ${modId}.`,
      data: fullResult,
    });
  } catch (error: any) {
    console.error("❌ Erreur API /api/content/generate :", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur interne lors de la génération pédagogique.",
      },
      { status: 500 }
    );
  }
}
