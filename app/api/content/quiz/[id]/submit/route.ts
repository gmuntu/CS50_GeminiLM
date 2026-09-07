import { NextRequest, NextResponse } from 'next/server';
import { submitQuizAttempt } from '@/lib/services/pedagogy.service';

/**
 * POST /api/content/quiz/[id]/submit
 * Corrige une soumission de QCM, calcule le score et enregistre la tentative d'évaluation.
 *
 * Corps JSON :
 * - answers : Record<string, string> // { [questionId]: "A" | "B" | "C" | "D" }
 * - userId : string (optionnel)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const body = await req.json();
    const { answers, userId } = body;

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: "Identifiant de quiz 'id' manquant." },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: "L'objet 'answers' contenant les réponses aux questions est requis." },
        { status: 400 }
      );
    }

    const evaluation = await submitQuizAttempt({
      quizId,
      userId: userId || null,
      answers,
    });

    return NextResponse.json({
      success: true,
      quizId,
      score: evaluation.score,
      total: evaluation.total,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      attemptId: evaluation.attemptId,
      review: evaluation.review,
      socraticFeedback: evaluation.passed
        ? "Excellente maîtrise ! Vous avez validé les concepts clés explorés dans la session audio."
        : "Prenez le temps de réécouter l'audio Socratique correspondant pour bien saisir la logique sous-jacente des questions manquées.",
    });
  } catch (error: any) {
    console.error("❌ Erreur API /api/content/quiz/[id]/submit :", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la correction du quiz." },
      { status: 500 }
    );
  }
}
