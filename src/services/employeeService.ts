import { BadRequestError, NotFoundError } from "../errorHandler/appError";
import { createEmployee, iEmployee } from "../interfaces/employee";
import { iEmployeeRepository } from "../interfaces/employeeRepository";
import { iEmployeeService } from "../interfaces/employeeService";

export class EmployeeService implements iEmployeeService{
    constructor(private employeeRepository: iEmployeeRepository){}

    async create(employee: createEmployee): Promise<iEmployee | void> {
       const {name, position, baseSalary, yearsOfService} = employee

        if (!name || !position) {
        //    res.status(400).json({ message: 'Nombre y puesto son obligatorios' });
            throw new BadRequestError('Nombre y puesto son obligatorios')
        
        }

        if (typeof baseSalary !== 'number' || baseSalary <= 0) {
        //    res.status(400).json({ message: 'El salario base debe ser mayor a 0' });
            throw new BadRequestError('El salario base debe ser mayor a 0')
        }

        if (
            typeof yearsOfService !== 'number' ||
            yearsOfService < 0 ||
            !Number.isInteger(yearsOfService)
        ) {
            // res.status(400).json({ message: 'La antigüedad debe ser un entero mayor o igual a 0' });
            // }   
            throw new BadRequestError('La antigüedad debe ser un entero mayor o igual a 0')
        }

        const bonus = baseSalary * 0.02 * yearsOfService;
        const finalSalary = baseSalary + bonus;

        const newEmployee = {
            name,
            position, 
            baseSalary,
            yearsOfService,
            finalSalary
        }

        return await this.employeeRepository.create(newEmployee)
    }

    async find(): Promise<iEmployee[] | void> {
        const employees = await this.employeeRepository.find()
        if(!employees.length) throw new NotFoundError("No hay empleados registrados.")
        return employees
    }

    async findById(id: number): Promise<iEmployee | null> {
        const employee = await this.employeeRepository.findById(id)
        if(!employee) throw new NotFoundError("No existe un empleado con esta id")
        return employee
    }

}