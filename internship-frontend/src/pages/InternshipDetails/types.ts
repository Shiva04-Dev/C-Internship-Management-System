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

export interface Application {
  applicationID: number;
  internshipID: number;
  status: string;
}
