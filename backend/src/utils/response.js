export function sendData(res, data, { status = 200, message } = {}) {
  const body = { data };
  if (message) body.message = message;
  return res.status(status).json(body);
}

export function sendError(res, error) {
  const status = error.status || 500;
  const body = {
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: status >= 500 && process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message || "Something went wrong",
    },
  };

  if (error.details && process.env.NODE_ENV !== "production") {
    body.error.details = error.details;
  }

  return res.status(status).json(body);
}
