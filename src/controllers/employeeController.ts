import { NextFunction, Request, Response } from "express";
import { iEmployee } from "../interfaces/employee";
import { iEmployeeService } from "../interfaces/employeeService";

export class EmployeeController {
  constructor(private readonly employeeService: iEmployeeService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeService.create(req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> =>{
    try {
      const employees = await this.employeeService.find();
      res.status(200).json(employees);
    } catch (error) {
      next(error);
    }
  }

  findById = async(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> =>{
    try {
      const { id } = req.params;
      const employee = await this.employeeService.findById(id.toString());
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }
}
