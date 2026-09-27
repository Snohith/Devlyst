import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { projectIdSchema } from "../../../shared/schemas/index.js";
import { authorizeCollaboration, persistCollaborationFiles } from "../services/collaboration-service.js";
import { sendData } from "../utils/response.js";

export const internalRouter = Router();

internalRouter.use(requireAuth);

internalRouter.get("/collaboration/:projectId", validate({ params: projectIdSchema }), async (req, res, next) => {
  try {
    sendData(res, await authorizeCollaboration(req.params.projectId, req.user));
  } catch (error) {
    next(error);
  }
});

internalRouter.put("/collaboration/:projectId/files", validate({ params: projectIdSchema }), async (req, res, next) => {
  try {
    sendData(res, await persistCollaborationFiles(req.params.projectId, req.user, req.body));
  } catch (error) {
    next(error);
  }
});
