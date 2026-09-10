import "dotenv/config";
import express from "express";
import { router as employeeRouter } from "./routes/employeeRoutes";
import { ErrorHandler } from "./errorHandler/errorHanlderMiddleware";

export const app = express();
app.use(express.json());
app.use("/employees", employeeRouter);
app.use(ErrorHandler);
