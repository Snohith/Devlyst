import {
  DEFAULT_FILE_CONTENT,
  DEFAULT_FILE_NAME,
  EXTENSION_TO_LANGUAGE,
} from "../../../shared/constants/languages.js";
import { AuthorizationError, ConflictError, NotFoundError } from "../errors/app-error.js";
import { fileRepository } from "../repositories/file-repository.js";
import { projectRepository } from "../repositories/project-repository.js";
import { createRoomCode } from "../utils/room-code.js";

function languageFromFileName(name, fallback = "javascript") {
  const extension = name.split(".").pop()?.toLowerCase();
  return EXTENSION_TO_LANGUAGE[extension] || fallback;
}

export function serializeFile(file) {
  return {
    id: file.id,
    name: file.name,
    language: file.language,
    content: file.content,
    updatedAt: file.updatedAt.toISOString(),
  };
}

export function serializeProject(project, userId, { includeFiles = false } = {}) {
  const membership = project.members?.find((member) => member.userId === userId);
  const payload = {
    id: project.id,
    roomCode: project.roomCode,
    name: project.name,
    language: project.language,
    role: membership?.role || (project.ownerId === userId ? "OWNER" : "EDITOR"),
    owner: project.owner,
    fileCount: project._count?.files ?? project.files?.length ?? 0,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  if (includeFiles) {
    payload.files = (project.files || []).map(serializeFile);
  }

  return payload;
}

async function uniqueRoomCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const roomCode = createRoomCode();
    const existing = await projectRepository.findByRoomCode(roomCode);
    if (!existing) return roomCode;
  }
  throw new ConflictError("Could not allocate a room code", "ROOM_CODE_EXHAUSTED");
}

export async function createProject(user, input = {}) {
  const language = input.language || "javascript";
  const project = await projectRepository.createWithOwner({
    roomCode: await uniqueRoomCode(),
    name: input.name?.trim() || "Untitled Project",
    language,
    ownerId: user.id,
    file: {
      name: DEFAULT_FILE_NAME,
      language,
      content: DEFAULT_FILE_CONTENT,
    },
  });

  return serializeProject(project, user.id, { includeFiles: true });
}

export async function listProjects(user, limit) {
  const projects = await projectRepository.listForUser(user.id, limit);
  return projects.map((project) => serializeProject(project, user.id));
}

async function loadProject(identifier, user, { byRoomCode = false } = {}) {
  const project = byRoomCode
    ? await projectRepository.findByRoomCode(identifier)
    : await projectRepository.findById(identifier);

  if (!project) {
    throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  return {
    project,
    membership: project.members.find((member) => member.userId === user.id) || null,
  };
}

export async function assertProjectMember(projectId, user) {
  const { project, membership } = await loadProject(projectId, user);
  if (!membership) {
    throw new AuthorizationError("You are not a member of this project");
  }
  return { project, membership };
}

export async function getProject(projectId, user) {
  const { project } = await assertProjectMember(projectId, user);
  return serializeProject(project, user.id, { includeFiles: true });
}

export async function joinProject(roomCode, user) {
  const { project, membership } = await loadProject(roomCode, user, { byRoomCode: true });
  if (!membership) {
    await projectRepository.addMember(project.id, user.id, "EDITOR");
    project.members.push({ userId: user.id, role: "EDITOR" });
  }
  return serializeProject(project, user.id, { includeFiles: true });
}

export async function updateProject(projectId, user, input) {
  const { project, membership } = await assertProjectMember(projectId, user);
  if (input.name && membership.role !== "OWNER") {
    throw new AuthorizationError("Only the project owner can rename the project");
  }

  const updated = await projectRepository.update(project.id, {
    ...(input.name ? { name: input.name } : {}),
    ...(input.language ? { language: input.language } : {}),
  });
  return serializeProject(updated, user.id, { includeFiles: true });
}

export async function deleteProject(projectId, user) {
  const { project, membership } = await assertProjectMember(projectId, user);
  if (membership.role !== "OWNER") {
    throw new AuthorizationError("Only the project owner can delete the project");
  }
  await projectRepository.remove(project.id);
}
