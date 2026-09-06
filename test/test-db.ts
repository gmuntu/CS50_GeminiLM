import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log(`✅ Connexion réussie ! Nombre d'utilisateurs dans la base : ${userCount}`)
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données :", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()