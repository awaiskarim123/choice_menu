import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@choicemenu.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@choicemenu.com',
      phone: '03001234567',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', admin)

  // Create sample services
  const services = [
    {
      name: 'Tent Setup',
      description: 'Professional tent installation for any event size',
      price: 50000,
      isActive: true,
    },
    {
      name: 'Catering Service',
      description: 'Delicious food preparation and service',
      price: 80000,
      isActive: true,
    },
    {
      name: 'Sound System',
      description: 'High-quality audio equipment and setup',
      price: 30000,
      isActive: true,
    },
    {
      name: 'Lighting',
      description: 'Professional lighting solutions',
      price: 25000,
      isActive: true,
    },
    {
      name: 'Entertainment',
      description: 'DJ, music, and entertainment services',
      price: 40000,
      isActive: true,
    },
    {
      name: 'Event Planning',
      description: 'Complete event coordination and management',
      price: 60000,
      isActive: true,
    },
  ]

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    })
    
    if (!existing) {
      await prisma.service.create({
        data: service,
      })
    }
  }

  console.log('Sample services created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

