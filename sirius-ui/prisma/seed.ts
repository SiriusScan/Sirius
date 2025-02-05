import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Replace these values as needed; ensure your password is properly hashed!
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' }, // unique identifier for the user
    update: {}, // if the user exists, don't change anything (or update specific fields)
    create: {
      name: 'admin',
      email: 'admin@example.com',
      password: 'sirius', 
    },
  });
  console.log('Default user created or updated:', defaultUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });