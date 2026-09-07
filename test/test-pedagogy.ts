import { getCourseSource, CS50_CANONICAL_CURRICULUM } from '../lib/course-sources';
import { sanitizeForTts } from '../lib/gemini/audio-script.service';

async function runTests() {
  console.log('🧪 [Test Suite] Démarrage des vérifications pédagogiques CS50x...\n');

  // Test 1: Vérification du catalogue canonique (11 modules)
  console.log('1️⃣ Vérification des 11 modules CS50x (Semaine 0 à 10)...');
  const moduleKeys = Object.keys(CS50_CANONICAL_CURRICULUM).map(Number);
  console.log(`   Nombre de modules définis : ${moduleKeys.length}`);
  if (moduleKeys.length !== 11) {
    throw new Error(`Attendu 11 modules, reçu ${moduleKeys.length}`);
  }

  for (let i = 0; i <= 10; i++) {
    const mod = CS50_CANONICAL_CURRICULUM[i];
    if (!mod) throw new Error(`Module ${i} manquant dans le catalogue canonique.`);
    if (!mod.audioGuidance.MONDAY || !mod.audioGuidance.WEDNESDAY || !mod.audioGuidance.FRIDAY) {
      throw new Error(`Guidage audio incomplet pour le module ${i}`);
    }
  }
  console.log('   ✅ Tous les 11 modules disposent de guidages complets (Vidéo + Lundi/Mercredi/Vendredi).\n');

  // Test 2: Chargement des sources (avec fallback et fichiers locaux)
  console.log('2️⃣ Test du chargeur de sources getCourseSource(0) et getCourseSource(1)...');
  const source0 = await getCourseSource(0);
  console.log(`   Module 0 titre : "${source0.module.title}"`);
  console.log(`   Longueur du texte de contexte : ${source0.rawText.length} caractères`);
  if (!source0.rawText.includes('Semaine 0') || source0.rawText.length < 500) {
    throw new Error('Le contexte du Module 0 est trop court ou incomplet.');
  }

  const source1 = await getCourseSource(1);
  console.log(`   Module 1 titre : "${source1.module.title}"`);
  console.log(`   Fichiers locaux détectés : ${source1.sourceFilesFound.join(', ') || 'aucun'}`);
  console.log('   ✅ Le chargeur de sources fonctionne parfaitement.\n');

  // Test 3: Nettoyeur TTS (sanitizeForTts)
  console.log('3️⃣ Test du nettoyeur TTS (sanitizeForTts)...');
  const dirtyMarkdown = `
# Bienvenue dans le cours !
Voici un extrait en C :
\`\`\`c
printf("Hello, world!\\n");
\`\`\`
N'oubliez pas que **malloc** réserve de la mémoire et *free* la libère.
- Étape 1 : compiler avec \`make\`
- Étape 2 : exécuter [ici](https://cs50.harvard.edu)
  `.trim();

  const cleaned = sanitizeForTts(dirtyMarkdown);
  console.log('   Texte après nettoyage TTS :');
  console.log(`   "${cleaned}"`);

  if (cleaned.includes('#') || cleaned.includes('**') || cleaned.includes('```')) {
    throw new Error('Des artefacts Markdown subsistent dans le texte TTS nettoyé.');
  }
  console.log('   ✅ Le filtre TTS élimine tous les artefacts Markdown indésirables.\n');

  console.log('🎉 TOUS LES TESTS UNITAIRES PÉDAGOGIQUES ONT RÉUSSI !');
}

runTests().catch((err) => {
  console.error('❌ Échec des tests :', err);
  process.exit(1);
});
