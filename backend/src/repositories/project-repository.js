import { prisma } from "../db/prisma.js";

const summaryInclude = {
  owner: { select: { id: true, displayName: true } },
  members: { select: { userId: true, role: true } },
  _count: { select: { files: true } },
};

export const projectRepository = {
  findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        ...summaryInclude,
        files: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  findByRoomCode(roomCode) {
    return prisma.project.findUnique({
      where: { roomCode },
      include: {
        ...summaryInclude,
        files: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  listForUser(userId, limit = 20) {
    return prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: summaryInclude,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  },

  createWithOwner({ roomCode, name, language, ownerId, file }) {
    return prisma.project.create({
      data: {
        roomCode,
        name,
        language,
        ownerId,
        members: {
          create: { userId: ownerId, role: "OWNER" },
        },
        files: {
          create: file,
        },
      },
      include: {
        ...summaryInclude,
        files: true,
      },
    });
  },

  addMember(projectId, userId, role = "EDITOR") {
    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: { projectId, userId, role },
      update: {},
    });
  },

  update(id, data) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        ...summaryInclude,
        files: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  remove(id) {
    return prisma.project.delete({ where: { id } });
  },
};
