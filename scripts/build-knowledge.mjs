import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({});

// Petite fonction pour mettre le script en pause et éviter de surcharger Google
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeAndTranslate(weekNumber) {
  console.log(`\n🚀 Démarrage de l'extraction pour la Semaine ${weekNumber}...`);
  
  const url = `https://cs50.harvard.edu/x/2024/notes/${weekNumber}/`;
  
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    
    // Extraction du contenu principal
    const mainContent = $("main").text().trim().replace(/\n\s*\n/g, '\n');
    
    if (!mainContent || mainContent.length < 100) {
        console.log(`⚠️ Aucun contenu significatif trouvé pour la semaine ${weekNumber}.`);
        return;
    }

    console.log(`✅ Contenu anglais extrait. Envoi à Gemini (Cloud) pour traduction...`);

    const prompt = `
    Tu es l'éditeur de contenu en chef pour Savoir IA, une plateforme adaptant le cours CS50 pour l'Afrique francophone subsaharienne.
    Voici les notes de cours brutes de la semaine ${weekNumber} de Harvard.
    
    TA MISSION :
    1. Traduis tout le contenu en français de manière claire et professionnelle.
    2. Garde les termes techniques de code exacts pour ne pas casser la logique.
    3. Formate le texte de manière structurée.
    
    TEXTE ORIGINAL :
    ${mainContent}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const translatedText = response.text;

    // Sauvegarde dans le dossier course-sources
    const fileName = `semaine${weekNumber}.txt`;
    const filePath = path.join(process.cwd(), "content", "course-sources", fileName);
    
    // S'assurer que le dossier existe
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, translatedText, "utf-8");
    console.log(`🎉 Succès ! Fichier sauvegardé : ${filePath}`);

  } catch (error) {
    console.error(`❌ Erreur lors du traitement de la semaine ${weekNumber}:`, error.message);
  }
}

// Fonction principale pour lancer l'usine de la semaine 1 à 10
async function buildAllWeeks() {
  console.log("🏭 Démarrage de l'Usine à Contenu Savoir IA (Semaines 1 à 10)...");
  
  for (let i = 1; i <= 10; i++) {
    await scrapeAndTranslate(i);
    
    // On fait une pause entre chaque requête (sauf après la dernière)
    if (i < 10) {
      console.log("⏳ Pause de 10 secondes avant la prochaine semaine pour préserver l'API...");
      await delay(10000); 
    }
  }
  
  console.log("\n🏁 Usine à contenu terminée ! Tous les fichiers sont prêts dans le dossier course-sources.");
}

// Lancement uniquement pour la semaine manquante
scrapeAndTranslate(9);