import { executeCode } from "../services/execution-service.js";
import { sendData } from "../utils/response.js";

export async function execute(req, res, next) {
  try {
    const result = await executeCode(req.user, req.body);
    sendData(res, result);
  } catch (error) {
    next(error);
  }
}
