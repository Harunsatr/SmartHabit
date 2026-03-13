import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('adminnbang22', 12)
  const userPassword = await bcrypt.hash('userr00', 12)

  // Create/Update Admin account
  const admin = await prisma.user.upsert({
    where: { email: 'adminbrok@gmail.com' },
    update: {
      password: adminPassword,
      name: 'Admin Brok',
      role: 'ADMIN',
    },
    create: {
      email: 'adminbrok@gmail.com',
      password: adminPassword,
      name: 'Admin Brok',
      role: 'ADMIN',
      language: 'en',
      timezone: 'UTC',
    },
  })

  console.log('✅ Created/Updated Admin account:', admin.email)

  // Create/Update User account
  const user = await prisma.user.upsert({
    where: { email: 'user122@gmail.com' },
    update: {
      password: userPassword,
      name: 'User Test',
      role: 'USER',
    },
    create: {
      email: 'user122@gmail.com',
      password: userPassword,
      name: 'User Test',
      role: 'USER',
      language: 'en',
      timezone: 'UTC',
    },
  })

  console.log('✅ Created/Updated User account:', user.email)

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
