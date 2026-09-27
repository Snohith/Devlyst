import { sendData } from "../utils/response.js";
import { createFile, deleteFile, updateFile } from "../services/file-service.js";
import {
  createProject,
  deleteProject,
  getProject,
  joinProject,
  listProjects,
  updateProject,
} from "../services/project-service.js";

export async function create(req, res, next) {
  try {
    const project = await createProject(req.user, req.body);
    sendData(res, project, { status: 201 });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const projects = await listProjects(req.user, req.query.limit);
    sendData(res, projects);
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    sendData(res, await getProject(req.params.projectId, req.user));
  } catch (error) {
    next(error);
  }
}

export async function join(req, res, next) {
  try {
    sendData(res, await joinProject(req.params.roomCode, req.user));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    sendData(res, await updateProject(req.params.projectId, req.user, req.body));
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteProject(req.params.projectId, req.user);
    sendData(res, { deleted: true });
  } catch (error) {
    next(error);
  }
}

export async function addFile(req, res, next) {
  try {
    const file = await createFile(req.params.projectId, req.user, req.body);
    sendData(res, file, { status: 201 });
  } catch (error) {
    next(error);
  }
}

export async function patchFile(req, res, next) {
  try {
    const file = await updateFile(req.params.projectId, req.params.fileId, req.user, req.body);
    sendData(res, file);
  } catch (error) {
    next(error);
  }
}

export async function removeFile(req, res, next) {
  try {
    await deleteFile(req.params.projectId, req.params.fileId, req.user);
    sendData(res, { deleted: true });
  } catch (error) {
    next(error);
  }
}
