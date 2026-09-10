import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose, { Schema, model } from 'mongoose';

const app = express();
app.use(express.json());

const employeeSchema = new Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    yearsOfService: { type: Number, required: true },
    finalSalary: { type: Number, required: true }
  },
  { timestamps: true }
);

const Employee = model('Employee', employeeSchema);

app.post('/employees', async (req: Request, res: Response) => {
  try {
    const { name, position, baseSalary, yearsOfService } = req.body;

    if (!name || !position) {
      return res.status(400).json({ message: 'Nombre y puesto son obligatorios' });
    }

    if (typeof baseSalary !== 'number' || baseSalary <= 0) {
      return res.status(400).json({ message: 'El salario base debe ser mayor a 0' });
    }

    if (
      typeof yearsOfService !== 'number' ||
      yearsOfService < 0 ||
      !Number.isInteger(yearsOfService)
    ) {
      return res.status(400).json({ message: 'La antigüedad debe ser un entero mayor o igual a 0' });
    }

    const bonus = baseSalary * 0.02 * yearsOfService;
    const finalSalary = baseSalary + bonus;

    const employee = await Employee.create({
      name,
      position,
      baseSalary,
      yearsOfService,
      finalSalary
    });

    console.log(`Empleado creado: ${employee.name} - salario final: ${employee.finalSalary}`);
    return res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/employees', async (_req: Request, res: Response) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/employees/:id', async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    return res.json(employee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

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
