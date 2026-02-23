import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!rawPassword) {
    throw new Error('INITIAL_ADMIN_PASSWORD is required for database seed');
  }

  // Hash the password with bcrypt
  const hashedPassword = await hash(rawPassword, 10);
  
  try {
    // First, try to get the existing user
    const existingUser = await prisma.user.findUnique({
      where: { name: 'admin' }
    });
    
    if (existingUser) {
      // If the user exists, update the password
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      console.log('Admin user updated with new password:', updatedUser.name);
    } else {
      // If no user exists, create a new one
      const newUser = await prisma.user.create({
        data: {
          name: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
        }
      });
      console.log('New admin user created:', newUser.name);
    }
  } catch (error) {
    console.error('Error updating/creating admin user:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });