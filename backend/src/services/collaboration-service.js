import { z } from "zod";
import { MAX_SOURCE_BYTES } from "../../../shared/constants/languages.js";
import { ValidationError } from "../errors/app-error.js";
import { fileRepository } from "../repositories/file-repository.js";
import { prisma } from "../db/prisma.js";
import { assertProjectMember } from "./project-service.js";

const persistSchema = z.object({
  files: z.array(z.object({
    name: z.string().trim().min(1).max(120),
    content: z.string().max(MAX_SOURCE_BYTES),
  })).min(1).max(100),
});

export async function authorizeCollaboration(projectId, user) {
  const { project, membership } = await assertProjectMember(projectId, user);
  return {
    projectId: project.id,
    roomCode: project.roomCode,
    userId: user.id,
    role: membership.role,
    files: project.files.map((file) => ({
      id: file.id,
      name: file.name,
      language: file.language,
      content: file.content,
    })),
  };
}

export async function persistCollaborationFiles(projectId, user, body) {
  const parsed = persistSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid collaboration snapshot");
  }

  const { project } = await assertProjectMember(projectId, user);
  const byName = new Map(project.files.map((file) => [file.name, file]));

  await prisma.$transaction(parsed.data.files.map((file) => {
    const existing = byName.get(file.name);
    if (!existing) {
      return prisma.file.create({
        data: {
          projectId: project.id,
          name: file.name,
          language: project.language,
          content: file.content,
        },
      });
    }
    return fileRepository.update(existing.id, { content: file.content });
  }));

  return { persisted: parsed.data.files.length };
}
