import { prisma } from "../db/prisma.js";

export const executionRepository = {
  create(data) {
    return prisma.execution.create({ data });
  },
};
