import { NextRequest, NextResponse } from "next/server";
import { CS50_MODULES } from "@/config/courseModules";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé GEMINI_API_KEY introuvable dans .env.local" },
        { status: 500 }
      );
    }

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

    const systemInstruction = `Tu es Socrate, le tuteur IA officiel de CS50x Francophone.
Règles :
- Ne donne JAMAIS la réponse ou le code directement.
- Guide l'étudiant étape par étape par des questions courtes.
- Réponds toujours en français bienveillant et concis.
Support de cours :
${courseContent}`;

    // Appel direct à l'API Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nQuestion de l'étudiant : ${message}` }],
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Détail de l'erreur Google Gemini :", errorData);
      return NextResponse.json({ error: errorData }, { status: geminiResponse.status });
    }

    // Flux de réponse vers l'interface
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body?.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.substring(6));
                  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch {
                  // Ignore JSON partiel
                }
              }
            }
          }
        } catch (err) {
          console.error("Erreur de flux :", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}