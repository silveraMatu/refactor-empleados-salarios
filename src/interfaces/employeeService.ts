import { iEmployee } from "./employee";

export interface iEmployeeService {
    create(employee: iEmployee): Promise<iEmployee>
    find(): Promise<iEmployee[]>
    findById(id: number): Promise<iEmployee | null>
}