export interface Internship {
  internshipID: number;
  title: string;
  description: string;
  location: string;
  companyName: string;
  startDate: string;
  endDate: string;
}

export interface InternshipInfo {
  title?: string;
  companyName?: string;
}

export interface Application {
  applicationID: number;
  internshipID: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';
  appliedAt: string;
  internship?: InternshipInfo;
}

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
}
