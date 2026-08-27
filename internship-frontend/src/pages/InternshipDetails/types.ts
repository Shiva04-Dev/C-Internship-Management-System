export interface Internship {
  internshipID: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  startDate: string;
  endDate: string;
  companyName: string;
  duration?: string;
}

/**
 * `GET /api/Application/student/mine` nests the internship id under
 * `internship.internshipID`, not top-level — confirmed via direct response
 * inspection on 2026-08-27. A prior top-level `internshipID` field here made
 * `checkIfApplied()`'s comparison always false (same class of bug
 * `CompanyDashboard`'s `studentIdOf` comment documents for a different field).
 */
export interface Application {
  applicationID: number;
  status: string;
  internship?: {
    internshipID: number;
  };
}
