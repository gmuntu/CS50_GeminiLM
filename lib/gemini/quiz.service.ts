import { generateStructuredJson, GEMINI_DEFAULT_MODEL, GEMINI_PRO_MODEL } from './client';
import { getCourseSource } from '@/lib/course-sources';
import { DayOfWeekType } from './audio-script.service';

export interface QuizOptionItem {
  id: string; // 'A' | 'B' | 'C' | 'D'
  label: string; // 'Option A', etc.
  text: string;
}

export interface QuizQuestionPayload {
  order: number;
  question: string;
  options: QuizOptionItem[];
  correctOption: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  conceptTested: string;
}

export interface QuizPayload {
  dayOfWeek: DayOfWeekType;
  title: string;
  description: string;
  questions: QuizQuestionPayload[];
}

const QUIZ_SYSTEM_PROMPT = `
Tu es un Concepteur Pédagogique Senior et Examinateur Officiel pour CS50x Francophone (Savoir IA).
Ta mission est de concevoir des Quiz à Choix Multiples (QCMs) de haut niveau cognitif, évaluant la compréhension profonde des notions présentées dans les sessions audio hebdomadaires (Lundi, Mercredi, Vendredi).

RÈGLES D'OR DE CONCEPTION DES QCMS :
1. Évaluation de la compréhension, pas du par-cœur : Ne pose pas de questions triviales de mémorisation. Pose des énigmes, présente de courts extraits de code, ou décris des situations réelles nécessitant de la déduction.
2. Structure stricte par question :
   - Exactement 4 options identifiées par les lettres "A", "B", "C", "D".
   - 1 seule réponse correcte indiscutable.
   - 3 distracteurs hautement plausibles, construits à partir des erreurs conceptuelles les plus fréquentes des étudiants.
   - Une explication pédagogique détaillée qui justifie la bonne réponse ET explicite pourquoi les autres options sont des pièges classiques.
   - Le concept précis évalué (conceptTested).
3. Rythme hebdomadaire synchronisé :
   - Lundi : 3 à 4 questions d'intuition, de modèles mentaux et de logique fondamentale.
   - Mercredi : 3 à 4 questions d'implémentation, de syntaxe, de pièges de code et de mémoire.
   - Vendredi : 3 à 4 questions de complexité Big-O, d'optimisation système et de vision ingénieur.
`.trim();

/**
 * Génère un quiz QCM synchronisé pour un jour donné (Lundi, Mercredi ou Vendredi).
 */
export async function generateSingleQuiz(
  moduleId: number,
  dayOfWeek: DayOfWeekType,
  audioSummaryOrScript?: string
): Promise<QuizPayload> {
  const { module, rawText } = await getCourseSource(moduleId);
  const guidance = module.audioGuidance[dayOfWeek];

  const dayTitles: Record<DayOfWeekType, string> = {
    MONDAY: "Quiz Lundi : Validation de l'Intuition Conceptuelle",
    WEDNESDAY: "Quiz Mercredi : Atelier Technique & Pièges de Code",
    FRIDAY: "Quiz Vendredi : Recul Ingénieur, Performance & Architecture",
  };

  const prompt = `
Conçois un QCM rigoureux de 3 à 4 questions pour évaluer la compréhension de la session audio :
Module : Semaine ${module.id} - ${module.title}
Session du jour : ${dayOfWeek} (${dayTitles[dayOfWeek]})
Thème : ${guidance.theme}
Focus pédagogique : ${guidance.focus}
Notions & Analogies : ${guidance.analogiesAndConcepts.join(', ')}
Pièges ciblés : ${guidance.pitfallsOrKeyInsights.join(', ')}

${audioSummaryOrScript ? `CONTENU DU SCRIPT AUDIO ASSOCIÉ :\n${audioSummaryOrScript.slice(0, 1500)}\n` : ''}

SOURCES DE RÉFÉRENCE DU COURS :
${rawText}

FORMAT DE SORTIE ATTENDU (JSON STRICT) :
{
  "dayOfWeek": "${dayOfWeek}",
  "title": "${dayTitles[dayOfWeek]} - ${module.title}",
  "description": "Ce quiz évalue votre compréhension des principes explorés dans la session audio de ${dayOfWeek}.",
  "questions": [
    {
      "order": 1,
      "question": "Énoncé clair de la question (avec court extrait de code si pertinent)...",
      "options": [
        { "id": "A", "label": "Option A", "text": "Proposition A..." },
        { "id": "B", "label": "Option B", "text": "Proposition B..." },
        { "id": "C", "label": "Option C", "text": "Proposition C..." },
        { "id": "D", "label": "Option D", "text": "Proposition D..." }
      ],
      "correctOption": "B",
      "explanation": "Explication limpide justifiant pourquoi B est correcte et déconstruisant les pièges de A, C et D.",
      "conceptTested": "Nom précis de la notion évaluée"
    }
  ]
}
`.trim();

  return await generateStructuredJson<QuizPayload>({
    systemInstruction: QUIZ_SYSTEM_PROMPT,
    prompt,
    model: GEMINI_PRO_MODEL,
    temperature: 0.25,
  });
}

/**
 * Génère les 3 quiz de la semaine (Lundi, Mercredi, Vendredi) synchronisés avec leurs audios respectifs.
 */
export async function generateWeeklyQuizzes(
  moduleId: number,
  audioScripts?: {
    MONDAY?: { cleanTtsText: string };
    WEDNESDAY?: { cleanTtsText: string };
    FRIDAY?: { cleanTtsText: string };
  }
): Promise<{
  MONDAY: QuizPayload;
  WEDNESDAY: QuizPayload;
  FRIDAY: QuizPayload;
}> {
  const [monday, wednesday, friday] = await Promise.all([
    generateSingleQuiz(moduleId, 'MONDAY', audioScripts?.MONDAY?.cleanTtsText),
    generateSingleQuiz(moduleId, 'WEDNESDAY', audioScripts?.WEDNESDAY?.cleanTtsText),
    generateSingleQuiz(moduleId, 'FRIDAY', audioScripts?.FRIDAY?.cleanTtsText),
  ]);

  return {
    MONDAY: monday,
    WEDNESDAY: wednesday,
    FRIDAY: friday,
  };
}
