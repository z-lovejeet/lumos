import prisma from '../lib/prisma'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('Seeding default data...')

  // Load default data
  const gradeScalePath = path.join(__dirname, '../data/default-grade-scale.json')
  const markingSchemesPath = path.join(__dirname, '../data/default-marking-schemes.json')
  
  const defaultGradeScale = JSON.parse(fs.readFileSync(gradeScalePath, 'utf8'))
  const defaultMarkingSchemes = JSON.parse(fs.readFileSync(markingSchemesPath, 'utf8'))

  // Create a demo user for development
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@lumos.app' },
    update: {},
    create: {
      email: 'demo@lumos.app',
      name: 'Demo User',
      settings: { theme: 'system', notification: true },
    },
  })

  // Seed grade scale
  const existingGradeScale = await prisma.gradeScale.findFirst({
    where: { userId: demoUser.id, name: 'Standard 10-Point Scale' }
  })
  
  if (!existingGradeScale) {
    await prisma.gradeScale.create({
      data: {
        userId: demoUser.id,
        name: 'Standard 10-Point Scale',
        grades: defaultGradeScale,
        isActive: true,
      }
    })
  }

  // Seed marking schemes
  for (const scheme of defaultMarkingSchemes) {
    const existingScheme = await prisma.markingScheme.findFirst({
      where: { userId: demoUser.id, name: scheme.name }
    })

    if (!existingScheme) {
      await prisma.markingScheme.create({
        data: {
          userId: demoUser.id,
          name: scheme.name,
          components: scheme.components,
          isDefault: scheme.isDefault,
        }
      })
    }
  }

  console.log('Seeding complete. Demo user created: demo@lumos.app')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
