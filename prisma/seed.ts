/**
 * Prisma Seed Script
 *
 * Creates the initial admin user for the BatBliz admin panel.
 *
 * Usage:
 *   npx prisma db seed
 *
 * Required environment variables (set in .env):
 *   ADMIN_EMAIL    - Admin user email
 *   ADMIN_PASSWORD - Admin user password (min 8 chars)
 *   ADMIN_NAME     - Admin user display name
 */

import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  // Validate env vars
  if (!email || !password || !name) {
    console.error(
      "❌ Missing required environment variables. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in your .env file."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`⚠️  Admin user with email "${email}" already exists. Skipping.`);
    return;
  }

  // Hash password and create admin
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log("✅ Admin user created successfully:");
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
