import { generateStructuredJson, GEMINI_DEFAULT_MODEL } from './client';
import { getCourseSource } from '@/lib/course-sources';

export type DayOfWeekType = 'MONDAY' | 'WEDNESDAY' | 'FRIDAY';

export interface DialogueLine {
  speaker: 'Socrate' | 'Étudiant';
  text: string;
}

export interface AudioScriptPayload {
  dayOfWeek: DayOfWeekType;
  title: string;
  pedagogicalObjective: string;
  targetDurationMinutes: number;
  dialogue: DialogueLine[];
  cleanTtsText: string;
}

const AUDIO_SCRIPT_SYSTEM_PROMPT = `
Tu es "Socrate", le tuteur et guide pédagogique vocal de référence pour CS50x Francophone (Savoir IA).
Ta mission est de rédiger des scripts audio d'apprentissage profond, immersifs, stimulants et interactifs.

LE STYLE SOCRATIQUE :
- Tu ne balances JAMAIS une réponse toute faite : tu questionnes, tu suscites l'étonnement, tu guides l'étudiant vers l'eurêka.
- Tu utilises des métaphores concrètes du quotidien pour ancrer chaque notion informatique abstraite.
- Le ton est chaleureux, bienveillant, intellectuellement exigeant et captivant.

LE FORMAT TTS-READY (Synthèse Vocale Google Cloud) :
- Le champ "cleanTtsText" est OBLIGATOIREMENT préparé pour être lu par un moteur Text-to-Speech (Neural2-D).
- AUCUN symbole Markdown brut dans "cleanTtsText" (pas de **, pas de #, pas de backticks, pas de tirets de liste).
- Utilise une ponctuation orale riche (virgules pour respirer, points d'interrogation, points de suspension "..." pour marquer de vraies pauses de réflexion).
- Transcris oralement les symboles techniques et termes de code afin que la voix neuronale ne bégaye pas :
  * "printf" -> "print-eff"
  * "malloc" -> "mal-loc"
  * "free" -> "frii"
  * "\\0" -> "antislash zéro"
  * "SQL" -> "S-Q-L"
  * "O(n)" -> "grand O de n"
  * "O(log n)" -> "grand O de log de n"
  * "argc, argv" -> "arg-C et arg-V"
  * "&&" -> "et logique"
  * "||" -> "ou logique"
`.trim();

/**
 * Nettoie une chaîne textuelle de tout artefact Markdown pour une synthèse vocale limpide.
 */
export function sanitizeForTts(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' [extrait de code omis pour la voix] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/>\s*/g, '')
    .replace(/[-*•]\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Génère le script audio socratique d'un jour spécifique (Lundi, Mercredi ou Vendredi).
 */
export async function generateSingleAudioScript(
  moduleId: number,
  dayOfWeek: DayOfWeekType
): Promise<AudioScriptPayload> {
  const { module, rawText } = await getCourseSource(moduleId);
  const guidance = module.audioGuidance[dayOfWeek];

  const dayTitles: Record<DayOfWeekType, string> = {
    MONDAY: "Lundi : L'Éveil & L'Intuition Socratique",
    WEDNESDAY: "Mercredi : L'Atelier de Code & La Mécanique Profonde",
    FRIDAY: "Vendredi : L'Œil de l'Ingénieur & Le Défi Pratique",
  };

  const dayFocusInstructions: Record<DayOfWeekType, string> = {
    MONDAY: `
Objectif de la session du LUNDI :
- Éveiller la curiosité et construire une intuition solide avant la syntaxe.
- Utiliser l'analogie phare : ${guidance.analogiesAndConcepts.join(' / ')}.
- Poser la question socratique centrale : "${guidance.socraticQuestion}".
- Déconstruire les idées reçues : ${guidance.pitfallsOrKeyInsights.join(' / ')}.
    `.trim(),
    WEDNESDAY: `
Objectif de la session du MERCREDI :
- Entrer dans l'atelier de programmation : que se passe-t-il réellement dans le processeur et la mémoire ?
- Décortiquer les notions : ${guidance.analogiesAndConcepts.join(' / ')}.
- Autopsier les pièges classiques et erreurs de débutant : ${guidance.pitfallsOrKeyInsights.join(' / ')}.
- Questionner l'étudiant sur la mécanique interne : "${guidance.socraticQuestion}".
    `.trim(),
    FRIDAY: `
Objectif de la session du VENDREDI :
- Prendre de la hauteur avec le regard de l'ingénieur système.
- Analyser la complexité asymptotique, l'optimisation, les compromis de performance (Big-O, temps vs espace) : ${guidance.analogiesAndConcepts.join(' / ')}.
- Identifier les pièges d'architecture : ${guidance.pitfallsOrKeyInsights.join(' / ')}.
- Lancer le défi réflexif de fin de semaine : "${guidance.socraticQuestion}".
    `.trim(),
  };

  const prompt = `
Rédige le script audio Socratique complet pour la session suivante :
Module : Semaine ${module.id} - ${module.title}
Jour de la semaine : ${dayOfWeek} (${dayTitles[dayOfWeek]})
Thème : ${guidance.theme}
Focus pédagogique : ${guidance.focus}

DIRECTIVES DU JOUR :
${dayFocusInstructions[dayOfWeek]}

DONNÉES DE RÉFÉRENCE DU COURS :
${rawText}

FORMAT DE SORTIE ATTENDU (JSON STRICT) :
{
  "dayOfWeek": "${dayOfWeek}",
  "title": "${dayTitles[dayOfWeek]} - ${guidance.theme}",
  "pedagogicalObjective": "Objectif pédagogique opérationnel en une phrase claire.",
  "targetDurationMinutes": 5,
  "dialogue": [
    {
      "speaker": "Socrate",
      "text": "Réplique stimulante, questionnement ou mise en situation de Socrate..."
    },
    {
      "speaker": "Étudiant",
      "text": "Réflexion, hésitation, hypothèse ou intuition de l'étudiant..."
    }
  ],
  "cleanTtsText": "Texte oralisé continu et immersif, combinant la voix de Socrate et les relances, parfaitement adapté pour être prononcé par un moteur de synthèse vocale neuronale (sans aucun markdown, avec pauses et ponctuation soignée)."
}
`.trim();

  const script = await generateStructuredJson<AudioScriptPayload>({
    systemInstruction: AUDIO_SCRIPT_SYSTEM_PROMPT,
    prompt,
    model: GEMINI_DEFAULT_MODEL,
    temperature: 0.35,
  });

  // Sécurisation supplémentaire : double nettoyage TTS au cas où
  script.cleanTtsText = sanitizeForTts(script.cleanTtsText);

  return script;
}

/**
 * Génère les 3 scripts audios de la semaine (Lundi, Mercredi, Vendredi).
 */
export async function generateWeeklyAudioScripts(
  moduleId: number
): Promise<{
  MONDAY: AudioScriptPayload;
  WEDNESDAY: AudioScriptPayload;
  FRIDAY: AudioScriptPayload;
}> {
  const [monday, wednesday, friday] = await Promise.all([
    generateSingleAudioScript(moduleId, 'MONDAY'),
    generateSingleAudioScript(moduleId, 'WEDNESDAY'),
    generateSingleAudioScript(moduleId, 'FRIDAY'),
  ]);

  return {
    MONDAY: monday,
    WEDNESDAY: wednesday,
    FRIDAY: friday,
  };
}
