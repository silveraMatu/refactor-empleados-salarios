import { iEmployee } from "./employee";

export interface iEmployeeRepository {
  create(employee: iEmployee): Promise<iEmployee>;
  find(): Promise<iEmployee[]>;
  findById(id: string): Promise<iEmployee | null>;
}
