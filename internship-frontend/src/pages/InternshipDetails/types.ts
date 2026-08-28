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

// The internship id is nested under `internship.internshipID`, not top-level.
export interface Application {
  applicationID: number;
  status: string;
  internship?: {
    internshipID: number;
  };
}
