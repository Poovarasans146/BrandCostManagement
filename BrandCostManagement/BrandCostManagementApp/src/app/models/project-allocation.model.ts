export interface ProjectAllocation {
  projectAllocationId?: number;
  allocation: number;
  allocationStart?: string | null;
  allocationEnd?: string | null;
  employeeId: number;
  projectId: string;
  employeeName?: string;
  projectName?: string;
  brand?: string;
  role?: string;
}
