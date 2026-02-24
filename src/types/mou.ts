export type MOUStatus =
  | 'draft'
  | 'sent_to_admin'
  | 'sent_to_organiser'
  | 'final_agreed'
  | 'signed'
  | 'otp_sent';

export interface MOU {
  _id: string;
  mouNumber: string;
  organization: {
    name: string;
    email: string;
  };

  // Legacy + current status keys both exist across recovered screens
  status?: MOUStatus;
  currentStatus?: MOUStatus;

  pdfUrl?: string;
  signedPdfUrl?: string;
  finalPdfUrl?: string;

  htmlContent?: string;
  remarks?: string;
  allClauses?: string[];
  acceptedClauses?: string[];

  latestVersionId?: string;
  signedAt?: string | number | Date;
  createdAt: string;
}
