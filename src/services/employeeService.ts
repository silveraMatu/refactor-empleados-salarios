import { iEmployee } from "../interfaces/employee";
import { iEmployeeRepository } from "../interfaces/employeeRepository";
import { iEmployeeService } from "../interfaces/employeeService";

export class EmployeeService implements iEmployeeService{
    constructor(private employeeRepository: iEmployeeRepository){}

    async create(employee: iEmployee): Promise<iEmployee> {
       return await this.employeeRepository.create(employee)
    }

    async find(): Promise<iEmployee[]> {
        return await this.employeeRepository.find()
    }

    async findById(id: number): Promise<iEmployee | null> {
        return this.employeeRepository.findById(id)
    }

}