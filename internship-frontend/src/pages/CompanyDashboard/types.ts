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

export interface Student {
  studentID?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Application {
  applicationID: number;
  /**
   * NOT sent by the API at the top level — `GET /api/Application/internship/{id}`
   * nests the id as `student.studentID`. Kept optional (rather than deleted) so
   * a future flatter payload still type-checks; read it through
   * `studentIdOf(app)` in ApplicationsModal, never directly.
   */
  studentID?: number;
  internshipID: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedAt: string;
  resumePath?: string;
  student?: Student;
}

/**
 * Shape of `GET /api/Company/banned-students`, verified live against the
 * running API on 2026-08-24:
 * `{ banId, studentId, studentName, studentEmail, bannedAt, reason }`.
 * The previous `{ studentID | id, name, email }` guess matched none of those,
 * so every row rendered a blank name/email and Unban POSTed
 * `/api/Company/unban-student/0` (404). It went unnoticed because banning was
 * itself broken (see `studentIdOf` in ApplicationsModal), so this list was
 * always empty.
 */
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
