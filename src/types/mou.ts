export interface MOU {
  _id: string;
  mouNumber: string;
  organization: {
    name: string;
    email: string;
  };
  status: 'draft' | 'otp_sent' | 'signed';
  pdfUrl: string;
  signedPdfUrl?: string;
  createdAt: string;
}
