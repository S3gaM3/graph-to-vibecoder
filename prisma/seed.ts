import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const users = [
  { slug: "vitya", displayName: "Витя", envKey: "SEED_USER_VITYA_PASSWORD" as const },
  { slug: "sega", displayName: "Сёга", envKey: "SEED_USER_SEGA_PASSWORD" as const },
];

async function main() {
  for (const u of users) {
    const plain = process.env[u.envKey];
    if (!plain || plain.length < 8) {
      throw new Error(
        `Set ${u.envKey} to a password with at least 8 characters before seeding.`,
      );
    }
    const passwordHash = await bcrypt.hash(plain, 12);
    await prisma.user.upsert({
      where: { slug: u.slug },
      create: {
        slug: u.slug,
        displayName: u.displayName,
        passwordHash,
      },
      update: {
        displayName: u.displayName,
        passwordHash,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
