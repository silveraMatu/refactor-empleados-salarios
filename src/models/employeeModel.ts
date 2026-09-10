import { model, Schema } from "mongoose";
import { iEmployee } from "../interfaces/employee";

const employeeSchema = new Schema<iEmployee>( //Se agregó el generic <iEmployee> para indicar que el esquema está basado en la interfaz iEmployee
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    yearsOfService: { type: Number, required: true },
    finalSalary: { type: Number, required: true }
  },
  { timestamps: true }
);

export const Employee = model('Employee', employeeSchema);