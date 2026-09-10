import { Request, Response } from "express";
import { iEmployee } from "../interfaces/employee";
import { iEmployeeService } from "../interfaces/employeeService";

export class EmployeeController{
    constructor(private employeeService: iEmployeeService){}

    
    create = async (req: Request, res: Response): Promise<void> => {
        try{
            const employee = await this.employeeService.create(req.body)
            res.status(201).json(employee)
        }catch{

        }
    }

    async findAll(_req: Request, res: Response): Promise<void> {
        const employees = await this.employeeService.find()
        res.json(200).json(employees)
    }

    async findById(req: Request, res: Response): Promise<void> {
        const {id} = req.params
        const employee = await this.employeeService.findById(Number(id))
        res.status(200).json(employee)
    }
}