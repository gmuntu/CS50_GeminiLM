import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { prisma } from '../lib/prisma';
import { generateAndSaveVideoSummary } from '../lib/services/pedagogy.service';

async function main() {
  console.log('🚀 Test de génération et sauvegarde du résumé vidéo de la Semaine 0 en base Neon...');
  const result = await generateAndSaveVideoSummary(0);
  console.log('✅ Résumé vidéo enregistré avec succès !');
  console.log(`   Titre : ${result.saved.title}`);
  console.log(`   ID en BDD : ${result.saved.id}`);
  console.log(`   Nombre de concepts clés : ${(result.saved.keyConcepts as any[])?.length}`);
  console.log(`   Aperçu : ${result.saved.overview.slice(0, 150)}...`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
