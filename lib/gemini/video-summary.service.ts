import { generateStructuredJson, GEMINI_DEFAULT_MODEL } from './client';
import { getCourseSource } from '@/lib/course-sources';

export interface KeyConceptItem {
  term: string;
  definition: string;
  importance: string;
}

export interface TimelineBreakdownItem {
  timestamp?: string;
  title: string;
  description: string;
  keyPoints: string[];
}

export interface CodeExampleItem {
  language: string;
  title: string;
  code: string;
  explanation: string;
}

export interface VideoSummaryPayload {
  title: string;
  overview: string;
  keyConcepts: KeyConceptItem[];
  timelineBreakdown: TimelineBreakdownItem[];
  codeExamples: CodeExampleItem[];
  pedagogicalTakeaway: string;
  fullMarkdown: string;
}

const VIDEO_SUMMARY_SYSTEM_PROMPT = `
Tu es un Ingénieur Pédagogique Principal et Développeur Senior pour "Savoir IA / CS50x Francophone".
Ton rôle est de concevoir un résumé vidéo long, ultra-structuré, stimulant et pédagogiquement exemplaire pour les étudiants suivant le cursus officiel CS50x de Harvard (Semaine 0 à Semaine 10).

DIRECTIVES STRICTES DE RÉDACTION :
1. Rigueur conceptuelle : Aucun compromis sur la justesse technique. Conserve les termes de code exacts en anglais (ex: malloc, free, printf, pointer, Big-O, SQLite, CSS Flexbox, MVC, HTTP headers, etc.), tout en formulant des explications en français élégant, clair et accessible.
2. Structure du résumé vidéo :
   - Un aperçu global (overview) percutant reliant le concept à un cas d'usage réel.
   - Les concepts clés définis avec rigueur et leur raison d'être.
   - Un découpage chronologique / thématique progressif (timelineBreakdown) avec points clés.
   - Des exemples de code concrets, impeccablement commentés et expliqués.
   - Ce qu'il faut retenir absolument (pedagogicalTakeaway).
   - Un document Markdown intégral (fullMarkdown) prêt pour l'affichage riche avec titres, alertes, listes et blocs de code.
3. Respect strict du format JSON de sortie demandé.
`.trim();

/**
 * Génère un résumé vidéo long et structuré pour un module CS50 donné.
 */
export async function generateVideoSummary(moduleId: number): Promise<VideoSummaryPayload> {
  const { module, rawText } = await getCourseSource(moduleId);

  const prompt = `
Génère le résumé vidéo long et structuré pour le module suivant :
Module ID : ${module.id}
Titre : ${module.title}

CONSIGNE PÉDAGOGIQUE POUR LA VIDÉO :
- Accroche (Hook) : ${module.videoGuidance.hook}
- Démonstration centrale : ${module.videoGuidance.demonstration}
- Ce qu'il faut retenir absolument : ${module.videoGuidance.coreTakeaway}

SOURCES ET DONNÉES DU COURS :
${rawText}

FORMAT DE SORTIE ATTENDU (JSON STRICT) :
{
  "title": "Titre complet du résumé vidéo (ex: Semaine ${module.id} : Synthèse Magistrale)",
  "overview": "Résumé global et captivant en 2 à 3 paragraphes expliquant les enjeux du cours.",
  "keyConcepts": [
    {
      "term": "Nom du concept (ex: Transistor, Pointeur, Arbre binaire, SQL Injection)",
      "definition": "Définition pédagogique précise et sans ambiguïté",
      "importance": "Pourquoi ce concept est fondamental pour l'étudiant et l'ingénieur"
    }
  ],
  "timelineBreakdown": [
    {
      "timestamp": "00:00",
      "title": "Partie 1 : Accroche et intuition initiale",
      "description": "Explication détaillée de la section",
      "keyPoints": ["Point clé 1", "Point clé 2"]
    }
  ],
  "codeExamples": [
    {
      "language": "c / python / sql / html / etc.",
      "title": "Titre explicatif de l'extrait de code",
      "code": "// Code source propre, robuste et commenté",
      "explanation": "Explication ligne par ligne de la mécanique interne"
    }
  ],
  "pedagogicalTakeaway": "Synthèse mémorable des compétences opérationnelles acquises lors de cette semaine."
}
`.trim();

  const data = await generateStructuredJson<Omit<VideoSummaryPayload, 'fullMarkdown'>>({
    systemInstruction: VIDEO_SUMMARY_SYSTEM_PROMPT,
    prompt,
    model: GEMINI_DEFAULT_MODEL,
    temperature: 0.25,
  });

  const fullMarkdown = `
# ${data.title}

## 🌟 Vue d'ensemble
${data.overview}

## 💡 Concepts Fondamentaux
${data.keyConcepts?.map(c => `### 🔹 ${c.term}\n**Définition :** ${c.definition}\n\n*Pourquoi c'est capital :* ${c.importance}`).join('\n\n') || ''}

## ⏱️ Découpage Vidéo & Points Clés
${data.timelineBreakdown?.map(t => `### 📌 ${t.timestamp ? `[${t.timestamp}] ` : ''}${t.title}\n${t.description}\n${t.keyPoints?.map(p => `- ${p}`).join('\n') || ''}`).join('\n\n') || ''}

## 💻 Extraits de Code & Analyse
${data.codeExamples?.map(e => `### ⚙️ ${e.title}\n\`\`\`${e.language || 'text'}\n${e.code}\n\`\`\`\n*Explication :* ${e.explanation}`).join('\n\n') || ''}

## 🎯 Ce qu'il faut retenir absolument
${data.pedagogicalTakeaway}
`.trim();

  return {
    ...data,
    fullMarkdown,
  };
}
