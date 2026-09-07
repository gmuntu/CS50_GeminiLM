import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/progress/reset
 * Corps JSON : { moduleId?: number }
 * Si moduleId est fourni, réinitialise uniquement ce module.
 * Sinon, réinitialise toute la progression.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { moduleId } = body;

    if (moduleId !== undefined) {
      // Trouver les quiz associés à ce module
      const quizzes = await prisma.quiz.findMany({
        where: { moduleId }
      });
      const quizIds = quizzes.map(q => q.id);

      if (quizIds.length > 0) {
        await prisma.quizAttempt.deleteMany({
          where: {
            quizId: { in: quizIds }
          }
        });
      }
    } else {
      // Réinitialisation totale
      await prisma.quizAttempt.deleteMany({});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur DELETE /api/progress/reset:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
