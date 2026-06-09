import { v4 as uuidv4 } from 'uuid';

export interface CommunityGrammarCertificateProps {
  id?: string;
  userId: string;
  level: string;
  examType?: string;
  serialNumber: string;
  issuedAt?: Date;
  metadata?: any;
}

export class CommunityGrammarCertificateEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly level: string;
  public readonly examType: string;
  public readonly serialNumber: string;
  public readonly issuedAt: Date;
  public metadata: any;

  constructor(props: CommunityGrammarCertificateProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.level = props.level;
    this.examType = props.examType || 'CEFR';
    this.serialNumber = props.serialNumber;
    this.issuedAt = props.issuedAt || new Date();
    this.metadata = props.metadata || {};
  }
}
