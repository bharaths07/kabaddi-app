export type CertificateType = 'participation' | 'achievement' | 'man_of_match' | 'tournament_winner';

export interface CertificateTemplate {
  id: string;
  name: string;
  layoutJson: string; // Serialized layout data for the renderer
  thumbnailUrl: string;
  supportedTypes: CertificateType[];
  dimensions: { width: number; height: number };
}

export interface Certificate {
  id: string;
  templateId: string;
  type: CertificateType;

  // Recipient
  recipientId: string;
  recipientName: string;
  recipientRole?: string;
  playerId?: string;

  // Context
  matchId?: string;
  tournamentId?: string;
  achievementId?: string;

  // Content
  title: string;
  description?: string;
  date: string; // ISO Date string

  // Verification & Security
  issueDate: string;
  issuerId: string; // User/Admin who issued it
  signatureUrl?: string; // Digital signature image
  verificationHash: string; // SHA-256 hash of the cert data for QR verification
  status: 'draft' | 'issued' | 'revoked';

  // Metadata for rendering
  metadata: {
    matchName?: string;
    sportName?: string;
    location?: string;
    organizerName?: string;
    teamName?: string;
    [key: string]: any;
  };
}
