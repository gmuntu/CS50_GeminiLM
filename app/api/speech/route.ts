import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.GOOGLE_TTS_API_KEY?.trim();

    if (!apiKey) {
      console.error("❌ Clé API Google Cloud TTS manquante dans .env.local");
      return NextResponse.json({ error: "Clé API Google Cloud TTS manquante" }, { status: 500 });
    }

    // Appel à l'API Google Cloud Text-to-Speech avec la voix neuronale française
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-D' }, 
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 Erreur Google Cloud TTS :", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: data.error?.message || "Erreur de l'API Google Cloud" }, { status: 500 });
    }

    // Renvoi du flux audio en base64
    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error: any) {
    console.error("🔥 Erreur serveur interne :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}