import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@morauto.com.br" },
    update: {},
    create: {
      email: "admin@morauto.com.br",
      password: hashedPassword,
      name: "Admin Morauto",
      role: "ADMIN"
    }
  })

  // Create default categories
  const catEcon = await prisma.category.upsert({
    where: { name: "Econômico" },
    update: {},
    create: {
      name: "Econômico",
      dailyRate: 150.00,
      depositValue: 1000.00
    }
  })

  const catSUV = await prisma.category.upsert({
    where: { name: "SUV Premium" },
    update: {},
    create: {
      name: "SUV Premium",
      dailyRate: 350.00,
      depositValue: 3000.00
    }
  })

  const catLuxo = await prisma.category.upsert({
    where: { name: "Esportivo/Luxo" },
    update: {},
    create: {
      name: "Esportivo/Luxo",
      dailyRate: 850.00,
      depositValue: 8000.00
    }
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
