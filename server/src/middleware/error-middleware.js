import { ZodError } from "zod";

export default function errorHandler(err, req, res, next) {
  //log the raw error in development only, or in logs aggregator
  console.error(err.stack || err);

  //handle Zod validation errors => 400
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: err.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  //if error explicitly has a status code, use it
  const status = err.status || 500;

  //provide a safe error message
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
}
