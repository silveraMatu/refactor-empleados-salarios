import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";

export const ErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  console.error("Erorr desconocido", err);
  res.status(500).json({
    status: "error",
    statusCode: 500,
    message: "Error interno del servidor",
  });
};
