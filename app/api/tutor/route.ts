import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CS50_MODULES } from "@/config/courseModules";
import fs from "fs";
import path from "path";
export const dynamic = "force-dynamic";

// Initialisation
const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { message, moduleId } = await req.json();

    const courseModule = CS50_MODULES[moduleId ?? 0];
    let courseContent = "";

    if (courseModule) {
      const filePath = path.join(
        process.cwd(),
        "content",
        "course-sources",
        courseModule.sourceFileName
      );
      if (fs.existsSync(filePath)) {
        courseContent = fs.readFileSync(filePath, "utf-8");
      }
    }

    const systemInstruction = `Tu es Socrate, le tuteur IA officiel de la plateforme CS50x Francophone.
RÈGLES STRICTES :
1. Applique scrupuleusement la MÉTHODE SOCRATIQUE : ne donne JAMAIS directement la solution ou le code final complet.
2. Guide l'étudiant étape par étape par des questions courtes, des analogies simples et des pistes de réflexion.
3. Réponds toujours en français bienveillant, clair et concis.
Support de cours officiel :
${courseContent}`;

    // L'ERREUR ÉTAIT ICI : Utilisation du VRAI nom de modèle
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Erreur détaillée Tutor API :", error);
    return NextResponse.json(
      { error: error?.message || "Erreur interne" },
      { status: 500 }
    );
  }
}