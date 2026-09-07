import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clé GEMINI_API_KEY introuvable. Veuillez renseigner GEMINI_API_KEY dans votre fichier .env ou .env.local."
    );
  }

  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

export const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
export const GEMINI_PRO_MODEL = process.env.GEMINI_PRO_MODEL || 'gemini-3.6-flash';

/**
 * Analyse et répare de manière résiliente les réponses JSON générées par un LLM
 * (gère les balises markdown, les caractères de contrôle non échappés \n, \r, \t dans les chaînes).
 */
export function safeJsonParse<T>(raw: string): T {
  // 1. Essai direct standard
  try {
    return JSON.parse(raw);
  } catch {}

  // 2. Nettoyage des balises Markdown ```json ... ```
  let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3. Réparation des sauts de ligne et caractères de contrôle littéraux non échappés à l'intérieur des chaînes
  let inString = false;
  let escaped = false;
  let fixed = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escaped) {
      fixed += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      fixed += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      fixed += char;
      continue;
    }

    if (inString) {
      if (char === '\n') {
        fixed += '\\n';
      } else if (char === '\r') {
        fixed += '\\r';
      } else if (char === '\t') {
        fixed += '\\t';
      } else if (char.charCodeAt(0) < 0x20) {
        // Supprime les autres caractères de contrôle ASCII invalides
      } else {
        fixed += char;
      }
    } else {
      fixed += char;
    }
  }

  try {
    return JSON.parse(fixed);
  } catch (err: any) {
    console.error("Erreur de parsing après assainissement JSON :", fixed.slice(0, 500));
    throw new Error(`Impossible de parser la sortie JSON de Gemini: ${err.message}`);
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extrait le délai de réessai (en ms) depuis un message d'erreur 429 de l'API Gemini.
 * Cherche "retry in Xs" ou "retryDelay":"Xs" dans le message.
 */
function extractRetryDelay(errorMessage: string): number | null {
  // Match "retry in 45.5s" or "Please retry in 32.968s"
  const retryInMatch = errorMessage.match(/retry\s+in\s+([\d.]+)s/i);
  if (retryInMatch) {
    return Math.ceil(parseFloat(retryInMatch[1]) * 1000);
  }
  // Match "retryDelay":"45s"
  const retryDelayMatch = errorMessage.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
  if (retryDelayMatch) {
    return Math.ceil(parseFloat(retryDelayMatch[1]) * 1000);
  }
  return null;
}

/**
 * Exécute une requête Gemini avec contrainte de sortie JSON structurée,
 * gestion automatique des réessais en cas de forte affluence (503/429) et bascule de modèle.
 *
 * Pour les erreurs 429 (quota), on respecte le retryDelay indiqué par le serveur au lieu
 * de basculer sur un autre modèle (les quotas free tier s'appliquent à tous les modèles).
 */
export async function generateStructuredJson<T>(params: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}): Promise<T> {
  const ai = getGeminiClient();
  const requestedModel = params.model || GEMINI_DEFAULT_MODEL;
  
  const modelsToTry = [
    requestedModel,
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            temperature: params.temperature ?? 0.3,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error(`Réponse vide reçue du modèle Gemini (${model}).`);
        }

        return safeJsonParse<T>(text);
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const isQuotaExhausted =
          err?.status === 429 ||
          msg.includes('quota') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('Resource has been exhausted');
        const isUnavailable =
          err?.status === 503 ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE');
        const isTransient = isQuotaExhausted || isUnavailable;

        if (!isTransient) {
          throw err;
        }

        if (isQuotaExhausted) {
          console.warn(`⏳ [Gemini] Quota atteinte sur ${model}. Bascule vers un autre modèle...`);
          break; // Sort de la boucle des tentatives pour ce modèle, passe au modèle suivant
        }

        // Pour les erreurs 503 (haute demande), retry court puis fallback modèle
        if (isUnavailable && attempt < 3) {
          console.warn(
            `⚠️ [Gemini] Modèle ${model} temporairement saturé (Tentative ${attempt}/3). Réessai dans ${attempt * 3}s...`
          );
          await delay(attempt * 3000);
          continue;
        }

        if (isUnavailable) {
          console.warn(`🔄 [Gemini] Bascule vers un modèle alternatif après saturation de ${model}...`);
        }
        break; // Sort de la boucle des tentatives pour ce modèle, passe au modèle suivant
      }
    }
  }

  throw lastError;
}
