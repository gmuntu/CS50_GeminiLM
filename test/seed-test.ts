import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'etudiant@cs50x.fr' },
    update: {},
    create: {
      email: 'etudiant@cs50x.fr',
      name: 'Étudiant Test',
    },
  });

  console.log('✅ Utilisateur prêt :', user.id);

  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      moduleId: 1,                          // ✅ Int, pas String
      messages: [                           // ✅ Json = tableau JS direct, pas { create: ... }
        {
          role: 'user',
          content: 'Bonjour Socrate, aide-moi à comprendre les pointeurs en C.',
        },
      ],
    },
  });

  console.log('✅ Conversation et message créés avec succès :', conversation);
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
