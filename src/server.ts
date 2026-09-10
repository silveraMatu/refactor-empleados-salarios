import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose, { Schema, model } from 'mongoose';
import { router as employeeRouter} from './routes/employeeRoutes';
import { ErrorHandler } from './errorHandler/errorHanlderMiddleware';

const app = express();
app.use(express.json());
app.use('/employees', employeeRouter)
app.use(ErrorHandler)

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/employees_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB', error);
    process.exit(1);
  });
