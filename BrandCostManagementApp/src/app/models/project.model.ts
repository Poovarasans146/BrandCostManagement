export interface Project {
  projectId: string;
  buName: string;
  projectName: string;
  brand: string;
  approvedCount: number;
  allocatedCount: number;
  projectValue: number;
  brandLogo?: string | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}