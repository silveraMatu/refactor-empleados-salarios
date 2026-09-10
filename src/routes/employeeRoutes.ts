import { Router } from "express";
import { EmployeeRepository } from "../repository/employeeRepository";
import { EmployeeService } from "../services/employeeService";
import { EmployeeController } from "../controllers/employeeController";

export const router  = Router()

const employeeRepository = new EmployeeRepository()
const employeeService = new EmployeeService(employeeRepository)
const employeeController = new EmployeeController(employeeService) 

router.post('/', employeeController.create)
router.get('/', employeeController.findAll)
router.get('/:id', employeeController.findById)