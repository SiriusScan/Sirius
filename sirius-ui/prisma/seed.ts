import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!rawPassword) {
    throw new Error("INITIAL_ADMIN_PASSWORD is required for database seed");
  }

  const existingUser = await prisma.user.findUnique({
    where: { name: "admin" },
  });

  if (existingUser) {
    // Never clobber an existing admin password on restart. Only backfill identity fields.
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        subjectId: existingUser.subjectId || "local:admin",
        role: "admin",
        active: true,
      },
    });
    console.log(
      "Admin user already present; password left unchanged:",
      existingUser.name
    );
    return;
  }

  const hashedPassword = await hash(rawPassword, 12);
  const newUser = await prisma.user.create({
    data: {
      subjectId: "local:admin",
      name: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      active: true,
      mustChangePassword: false,
      sessionVersion: 0,
    },
  });
  console.log("New admin user created:", newUser.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
