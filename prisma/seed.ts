import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin320', 12)
  const userPassword = await bcrypt.hash('brokuser', 12)

  // Create Admin account
  const admin = await prisma.user.upsert({
    where: { email: 'admin321@gmail.com' },
    update: {},
    create: {
      email: 'admin321@gmail.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      language: 'en',
      timezone: 'UTC',
    },
  })

  console.log('✅ Created Admin account:', admin.email)

  // Create User account
  const user = await prisma.user.upsert({
    where: { email: 'userbrok@gmail.com' },
    update: {},
    create: {
      email: 'userbrok@gmail.com',
      password: userPassword,
      name: 'Demo User',
      role: 'USER',
      language: 'en',
      timezone: 'UTC',
    },
  })

  console.log('✅ Created User account:', user.email)

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
