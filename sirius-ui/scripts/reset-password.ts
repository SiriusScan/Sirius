#!/usr/bin/env bun
/**
 * Reset Password Utility for Sirius Scan
 *
 * This script allows administrators to reset a user's password from the command line.
 *
 * Usage with Bun:
 *   bun scripts/reset-password.ts --username <username> --password <new-password>
 *
 * Usage with Node + ts-node:
 *   npx ts-node scripts/reset-password.ts --username <username> --password <new-password>
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import minimist from "minimist";

const prisma = new PrismaClient();

async function resetPassword(
  username: string,
  newPassword: string
): Promise<void> {
  try {
    // Validate inputs
    if (!username) {
      throw new Error("Username is required");
    }

    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { name: username }],
      },
    });

    if (!user) {
      throw new Error(`User "${username}" not found`);
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`Password for user "${username}" has been reset successfully`);
  } catch (error) {
    console.error(
      "Error resetting password:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  const argv = minimist(process.argv.slice(2));

  // Display help if requested or if no arguments provided
  if (argv.help || argv.h || Object.keys(argv).length === 1) {
    console.log(`
Reset Password Utility for Sirius Scan

Usage with Bun:
  bun scripts/reset-password.ts --username <username> --password <new-password>

Usage with Node + ts-node:
  npx ts-node scripts/reset-password.ts --username <username> --password <new-password>

Options:
  --username, -u    Username or email of the account to reset
  --password, -p    New password to set
  --help, -h        Display this help message
    `);
    process.exit(0);
  }

  const username = argv.username || argv.u;
  const password = argv.password || argv.p;

  if (!username || !password) {
    console.error("Error: Both username and password are required");
    console.log("Use --help for usage information");
    process.exit(1);
  }

  await resetPassword(username, password);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
