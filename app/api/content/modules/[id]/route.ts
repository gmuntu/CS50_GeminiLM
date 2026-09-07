import { NextRequest, NextResponse } from 'next/server';
import { getModulePedagogy } from '@/lib/services/pedagogy.service';
import { CS50_CANONICAL_CURRICULUM } from '@/lib/course-sources';

/**
 * GET /api/content/modules/[id]
 * Récupère le paquet pédagogique complet d'une semaine (Résumé vidéo, 3 scripts audio Socratiques, 3 quiz synchronisés).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moduleId = Number(id);

    if (isNaN(moduleId) || moduleId < 0 || moduleId > 10) {
      return NextResponse.json(
        { success: false, error: "Identifiant de module invalide. Veuillez fournir un chiffre entre 0 et 10." },
        { status: 400 }
      );
    }

    const canonical = CS50_CANONICAL_CURRICULUM[moduleId];
    let moduleData = null;

    try {
      moduleData = await getModulePedagogy(moduleId);
    } catch (dbErr) {
      console.warn(`Lecture en BDD impossible pour le module ${moduleId}, renvoi des données canoniques :`, dbErr);
    }

    return NextResponse.json({
      success: true,
      moduleId,
      canonicalTitle: canonical?.title || `Semaine ${moduleId}`,
      canonicalSummary: canonical?.canonicalSummary || '',
      videoUrl: canonical?.videoUrl || moduleData?.videoUrl,
      isGeneratedInDb: Boolean(moduleData),
      data: moduleData || {
        message: "Ce module n'a pas encore été généré en base de données. Déclenchez sa création via POST /api/content/generate.",
        canonicalMetadata: canonical,
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur API /api/content/modules/[id] :", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
