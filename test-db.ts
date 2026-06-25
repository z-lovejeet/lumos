import prisma from './lib/prisma';

async function main() {
  console.log("Fetching user...");
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found in local DB, skipping test.");
    return;
  }
  
  console.log("Creating test career plan...");
  const cp = await prisma.careerPlan.create({
    data: {
      userId: user.id,
      type: 'test-type',
      data: { hello: "world" },
      progress: 50
    }
  });
  console.log("Created successfully with ID:", cp.id);
  
  const fetched = await prisma.careerPlan.findUnique({
    where: { id: cp.id }
  });
  console.log("Fetched successfully. Data:", fetched?.data);
  
  await prisma.careerPlan.delete({
    where: { id: cp.id }
  });
  console.log("Deleted test data successfully.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
