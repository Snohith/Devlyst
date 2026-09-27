import { EXTENSION_TO_LANGUAGE } from "../../../shared/constants/languages.js";
import { ConflictError, NotFoundError } from "../errors/app-error.js";
import { fileRepository } from "../repositories/file-repository.js";
import { assertProjectMember, serializeFile } from "./project-service.js";

function languageFromFileName(name, fallback = "javascript") {
  const extension = name.split(".").pop()?.toLowerCase();
  return EXTENSION_TO_LANGUAGE[extension] || fallback;
}

export async function createFile(projectId, user, input) {
  const { project } = await assertProjectMember(projectId, user);
  if (project.files.some((file) => file.name === input.name)) {
    throw new ConflictError("A file with that name already exists", "FILE_EXISTS");
  }

  return serializeFile(await fileRepository.create({
    projectId: project.id,
    name: input.name,
    language: input.language || languageFromFileName(input.name, project.language),
    content: input.content ?? "",
  }));
}

export async function updateFile(projectId, fileId, user, input) {
  const { project } = await assertProjectMember(projectId, user);
  const file = project.files.find((entry) => entry.id === fileId);
  if (!file) {
    throw new NotFoundError("File not found", "FILE_NOT_FOUND");
  }

  if (input.name && input.name !== file.name && project.files.some((entry) => entry.name === input.name)) {
    throw new ConflictError("A file with that name already exists", "FILE_EXISTS");
  }

  const nextName = input.name || file.name;
  return serializeFile(await fileRepository.update(file.id, {
    ...(input.name ? { name: input.name } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    language: input.language || (input.name ? languageFromFileName(nextName, file.language) : file.language),
  }));
}

export async function deleteFile(projectId, fileId, user) {
  const { project } = await assertProjectMember(projectId, user);
  const file = project.files.find((entry) => entry.id === fileId);
  if (!file) {
    throw new NotFoundError("File not found", "FILE_NOT_FOUND");
  }
  if (project.files.length <= 1) {
    throw new ConflictError("A project must keep at least one file", "LAST_FILE");
  }
  await fileRepository.remove(file.id);
}
