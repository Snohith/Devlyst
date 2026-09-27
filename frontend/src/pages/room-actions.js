import { apiRequest } from "../lib/api";

export async function refreshProject(projectId, token, preferredFileId) {
  const data = await apiRequest(`/api/projects/${projectId}`, { token });
  const selected = data.files.find((file) => file.id === preferredFileId) || data.files[0] || null;
  return { project: data, selected };
}

export async function createProjectFile(projectId, token, name) {
  return apiRequest(`/api/projects/${projectId}/files`, {
    token,
    method: "POST",
    body: { name },
  });
}

export async function deleteProjectFile(projectId, fileId, token) {
  return apiRequest(`/api/projects/${projectId}/files/${fileId}`, {
    token,
    method: "DELETE",
  });
}

export async function updateProjectLanguage(projectId, token, language) {
  return apiRequest(`/api/projects/${projectId}`, {
    token,
    method: "PATCH",
    body: { language },
  });
}

export async function runProjectCode(token, { language, code, projectId, fileId }) {
  return apiRequest("/api/executions", {
    token,
    method: "POST",
    body: { language, code, projectId, fileId },
  });
}
