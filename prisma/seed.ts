import prisma from '../lib/prisma'

async function main() {
  console.log('Seeding default data...')
  
  // Create default users or templates here if needed globally.
  // Note: Since everything is tied to a userId, actual seed data
  // should typically be created upon user registration or handled 
  // via default templates in the application logic.

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
