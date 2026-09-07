import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { prisma } from '../lib/prisma';
import { generateStructuredJson, GEMINI_DEFAULT_MODEL } from '../lib/gemini/client';
import { ensureCourseModule } from '../lib/services/pedagogy.service';

async function main() {
  console.log('🔍 [Vérification En Direct] Base Neon & API Gemini...\n');

  // 1. Test BDD Neon
  console.log('1. Test de connexion à Neon PostgreSQL...');
  const module0 = await ensureCourseModule(0);
  console.log(`   ✅ Module 0 créé/synchronisé en base : "${module0.title}" (ID: ${module0.id})`);

  // 2. Test Gemini API
  console.log('\n2. Test d\'appel à l\'API Google Gemini avec validation JSON...');
  const testResponse = await generateStructuredJson<{ status: string; greeting: string }>({
    prompt: 'Réponds en JSON avec {"status": "ok", "greeting": "Bonjour de Socrate"}',
    model: GEMINI_DEFAULT_MODEL,
    temperature: 0.1,
  });

  console.log(`   ✅ Réponse Gemini reçue : status="${testResponse.status}", greeting="${testResponse.greeting}"`);
  console.log('\n🎉 TOUT FONCTIONNE PARFAITEMENT ! Base Neon synchronisée et API Gemini opérationnelle.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
