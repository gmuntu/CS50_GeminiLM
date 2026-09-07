import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import {
  generateAndSaveVideoSummary,
  generateAndSaveAudioScripts,
  generateAndSaveQuizzes,
} from '../lib/services/pedagogy.service';

const prisma = new PrismaClient();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  for (let moduleId = 1; moduleId <= 10; moduleId++) {
    console.log(`\n\n=== MODULE ${moduleId} ===`);
    let rateLimited = false;
    
    // Check Video
    const video = await prisma.videoSummary.findUnique({ where: { moduleId } });
    if (!video) {
      console.log(`Génération Video Module ${moduleId}...`);
      try {
        await generateAndSaveVideoSummary(moduleId);
        await delay(5000); // 5 seconds between successful generations
      } catch (err: any) {
        console.error(`Erreur Video M${moduleId}:`, err.message);
        if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
           console.log('Attente de 65s...');
           await delay(65000);
           rateLimited = true;
        }
      }
    } else {
      console.log(`Video Module ${moduleId} existe déjà.`);
    }

    if (rateLimited) { moduleId--; continue; }

    // Check Audio
    for (const day of ['MONDAY', 'WEDNESDAY', 'FRIDAY'] as const) {
      const audio = await prisma.audioScript.findUnique({ where: { moduleId_dayOfWeek: { moduleId, dayOfWeek: day } } });
      if (!audio) {
        console.log(`Génération Audio ${day} Module ${moduleId}...`);
        try {
          await generateAndSaveAudioScripts(moduleId, day);
          await delay(5000);
        } catch (err: any) {
          console.error(`Erreur Audio ${day} M${moduleId}:`, err.message);
          if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
             console.log('Attente de 65s...');
             await delay(65000);
             rateLimited = true;
             break;
          }
        }
      } else {
        console.log(`Audio ${day} Module ${moduleId} existe déjà.`);
      }
    }

    if (rateLimited) { moduleId--; continue; }
    
    // Check Quiz
    for (const day of ['MONDAY', 'WEDNESDAY', 'FRIDAY'] as const) {
      const quiz = await prisma.quiz.findUnique({ where: { moduleId_dayOfWeek: { moduleId, dayOfWeek: day } } });
      if (!quiz) {
        console.log(`Génération Quiz ${day} Module ${moduleId}...`);
        try {
          await generateAndSaveQuizzes(moduleId, day);
          await delay(5000);
        } catch (err: any) {
          console.error(`Erreur Quiz ${day} M${moduleId}:`, err.message);
          if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
             console.log('Attente de 65s...');
             await delay(65000);
             rateLimited = true;
             break;
          }
        }
      } else {
        console.log(`Quiz ${day} Module ${moduleId} existe déjà.`);
      }
    }
    
    if (rateLimited) { moduleId--; continue; }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
