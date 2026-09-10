import { iEmployee } from "../interfaces/employee";
import { iEmployeeRepository } from "../interfaces/employeeRepository";
import { Employee } from "../models/employeeModel";

export class EmployeeRepository implements iEmployeeRepository {
  async create(employee: iEmployee): Promise<iEmployee> {
    return await Employee.create(employee);
  }

  async find(): Promise<iEmployee[]> {
    return await Employee.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<iEmployee | null> {
    return await Employee.findById(id);
  }
}
