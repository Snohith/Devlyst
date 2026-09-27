import { prisma } from "../db/prisma.js";

export const userRepository = {
  findByClerkId(clerkId) {
    return prisma.user.findUnique({ where: { clerkId } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  upsertFromClerk({ clerkId, email, displayName, imageUrl }) {
    return prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email, displayName, imageUrl },
      update: { email, displayName, imageUrl },
    });
  },
};
