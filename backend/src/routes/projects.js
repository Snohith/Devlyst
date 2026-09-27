import { Router } from "express";
import {
  addFile,
  create,
  join,
  list,
  patchFile,
  remove,
  removeFile,
  show,
  update,
} from "../controllers/project-controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createFileSchema,
  createProjectSchema,
  fileParamsSchema,
  listProjectsQuerySchema,
  projectIdSchema,
  roomCodeSchema,
  updateFileSchema,
  updateProjectSchema,
} from "../../../shared/schemas/index.js";

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.get("/", validate({ query: listProjectsQuerySchema }), list);
projectRouter.post("/", validate({ body: createProjectSchema }), create);
projectRouter.get("/join/:roomCode", validate({ params: roomCodeSchema }), join);
projectRouter.get("/:projectId", validate({ params: projectIdSchema }), show);
projectRouter.patch("/:projectId", validate({ params: projectIdSchema, body: updateProjectSchema }), update);
projectRouter.delete("/:projectId", validate({ params: projectIdSchema }), remove);
projectRouter.post("/:projectId/files", validate({ params: projectIdSchema, body: createFileSchema }), addFile);
projectRouter.patch("/:projectId/files/:fileId", validate({ params: fileParamsSchema, body: updateFileSchema }), patchFile);
projectRouter.delete("/:projectId/files/:fileId", validate({ params: fileParamsSchema }), removeFile);
