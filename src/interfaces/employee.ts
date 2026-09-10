export interface iEmployee {
  name: string;
  position: string;
  baseSalary: number;
  yearsOfService: number;
  finalSalary: number;
}

export type createEmployee = Omit<iEmployee, "finalSalary">