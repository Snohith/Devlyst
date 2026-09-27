import { prisma } from "../db/prisma.js";

export const fileRepository = {
  findById(id) {
    return prisma.file.findUnique({ where: { id } });
  },

  listByProject(projectId) {
    return prisma.file.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
  },

  create(data) {
    return prisma.file.create({ data });
  },

  update(id, data) {
    return prisma.file.update({ where: { id }, data });
  },

  remove(id) {
    return prisma.file.delete({ where: { id } });
  },

  countByProject(projectId) {
    return prisma.file.count({ where: { projectId } });
  },
};
