import { NextResponse } from 'next/server';
import { listModulesOverview } from '@/lib/services/pedagogy.service';
import { CS50_CANONICAL_CURRICULUM } from '@/lib/course-sources';

/**
 * GET /api/content/modules
 * Renvoie l'état global des 11 modules CS50x (de la semaine 0 à la semaine 10)
 * avec le statut de génération des résumés vidéo, des scripts audio et des quiz.
 */
export async function GET() {
  try {
    let dbModules: any[] = [];
    try {
      dbModules = await listModulesOverview();
    } catch (dbErr) {
      console.warn("Base de données non joignable ou vide pour listModulesOverview, utilisation du catalogue canonique :", dbErr);
    }

    const dbModuleMap = new Map(dbModules.map((m) => [m.id, m]));

    const result = Object.values(CS50_CANONICAL_CURRICULUM).map((canonical) => {
      const dbEntry = dbModuleMap.get(canonical.id);

      return {
        id: canonical.id,
        slug: canonical.slug,
        title: canonical.title,
        videoUrl: canonical.videoUrl,
        summary: canonical.canonicalSummary,
        status: {
          hasVideoSummary: Boolean(dbEntry?.videoSummary),
          audioScriptsCount: dbEntry?.audioScripts?.length || 0,
          quizzesCount: dbEntry?.quizzes?.length || 0,
          isFullyGenerated:
            Boolean(dbEntry?.videoSummary) &&
            (dbEntry?.audioScripts?.length || 0) >= 3 &&
            (dbEntry?.quizzes?.length || 0) >= 3,
        },
        audioDaysAvailable: dbEntry?.audioScripts?.map((a: any) => a.dayOfWeek) || [],
      };
    });

    return NextResponse.json({
      success: true,
      totalModules: result.length,
      modules: result,
    });
  } catch (error: any) {
    console.error("❌ Erreur API /api/content/modules :", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
