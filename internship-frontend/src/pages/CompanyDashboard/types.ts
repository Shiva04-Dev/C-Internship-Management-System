export interface Internship {
  internshipID: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: string;
  applicationCount?: number;
  requirements: string;
}

export interface ApplicationStatusCount {
  status: string;
  count: number;
}

export interface Student {
  studentID?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Application {
  applicationID: number;
  // Not actually sent at the top level; read it via `studentIdOf(app)` in ApplicationsModal.
  studentID?: number;
  internshipID: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedAt: string;
  resumePath?: string;
  student?: Student;
}

// Matches the real shape of GET /api/Company/banned-students, verified live.
export interface BannedStudent {
  banId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  bannedAt?: string;
  reason?: string;
}

export interface FormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface SearchStudent {
  studentID: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  university?: string;
  degree?: string;
  hasResume?: boolean;
}
