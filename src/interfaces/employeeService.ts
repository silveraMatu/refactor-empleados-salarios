import { iEmployee } from "./employee";

export interface iEmployeeService {
  create(employee: iEmployee): Promise<iEmployee | void>;
  find(): Promise<iEmployee[] | void>;
  findById(id: string): Promise<iEmployee | null>;
}
