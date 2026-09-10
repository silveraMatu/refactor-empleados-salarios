import { iEmployee } from "./employee";

export interface iEmployeeService {
    create(employee: iEmployee): Promise<iEmployee | void>
    find(): Promise<iEmployee[] | void>
    findById(id: number): Promise<iEmployee | null>
}