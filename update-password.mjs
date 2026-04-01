import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Mo@cySo@res269', 10)
  
  // Update or create main admin
  const user = await prisma.user.upsert({
    where: { email: 'admin@morauto.com.br' },
    update: { password: hashedPassword },
    create: {
      name: 'Moacy',
      email: 'admin@morauto.com.br',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  console.log('Senha atualizada com sucesso para admin@morauto.com.br')
  console.log(user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
