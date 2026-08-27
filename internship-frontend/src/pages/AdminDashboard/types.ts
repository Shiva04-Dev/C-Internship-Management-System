export interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  activeInternships: number;
  totalApplications: number;
}

export interface Dashboard {
  stats: DashboardStats;
}

export interface Reports {
  topCompanies?: Array<{ companyName: string; internshipCount: number; activeInternships: number }>;
  topStudents?: Array<{ studentName: string; applicationCount: number; acceptedCount: number }>;
  applicationsByStatus?: Array<{ status: string; count: number }>;
  internshipsByStatus?: Array<{ status: string; count: number }>;
  applicationsOverTime?: Array<{ date: string; count: number }>;
}

export interface Student {
  studentID: number;
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  degree?: string;
}

export interface Company {
  companyID: number;
  companyName: string;
  email: string;
  isApproved: boolean;
}

export interface BannedUser {
  banId: number;
  userId: number;
  userName: string;
  email: string;
  userType: 'Student' | 'Company';
  reason?: string;
  bannedAt: string;
}
