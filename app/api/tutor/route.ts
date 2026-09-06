import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, moduleId, content } = body;

    if (!content) {
      return NextResponse.json({ error: "Contenu manquant" }, { status: 400 });
    }

    // 1. Enregistrer le message en BDD
    await prisma.conversation.create({
      data: {
        userId: userId || "cmtopzd8b00003mwxnudf9q67",
        moduleId: moduleId ? Number(moduleId) : 1,
        messages: {
          create: {
            role: 'user',
            content,
          },
        },
      },
    });

    // 2. Appel Gemini en streaming avec le SDK officiel
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Tu es Socrate, un tuteur bienveillant pour le cours CS50. Réponds de manière pédagogique et Socratique (en posant des questions pour faire réfléchir l'étudiant) en français. Question de l'étudiant : ${content}`,
            },
          ],
        },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const textChunk = chunk.text; // 👈 Correction : chunk.text au lieu de chunk.text()
            if (textChunk) {
              controller.enqueue(encoder.encode(textChunk));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("Erreur durant le streaming Gemini :", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("❌ ERREUR API /api/tutor :", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}