export type StatusCategory = 'approved' | 'submitted' | 'pending' | 'rejected' | 'draft' | 'not-applicable';

export interface ProjectFeature {
  id: string;
  no: number;
  taskOrderId?: string; // Links back to a TO
  agreement: string; // E.g CE 47/2022 (GE)
  location: string;
  featureNo: string;
  s3rStatus: string;
  s3rCategory: StatusCategory;
  stlaXpStatus: string;
  stlaCategory: StatusCategory;
  accessPermission: string;
  accessCategory: StatusCategory;
  engineeringPlan: string;
  engineeringPlanCategory: StatusCategory;
  tprpTwvp: string;
  tprpTwvpCategory: StatusCategory;
  tprpMr: string;
  tprpMrCategory: StatusCategory;
  hsspStatus: string;
  hsspCategory: StatusCategory;
  remarks?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accepted: boolean;
  acceptedDate?: string;
  acceptedBy?: string;
}

export interface TaskOrder {
  id: string;
  agreementId: string;
  toNo: string; // e.g., "TO-01"
  title: string;
  status: 'Draft' | 'Issued' | 'Completed';
  dateIssued?: string;
  expectedCompletion?: string;
  remarks?: string;
}

export interface Invoice {
  id: string;
  agreementId: string;
  invoiceNo: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Rejected';
  dateSubmitted: string;
  datePaid?: string;
  linkedTaskOrders?: string[]; // IDs of Draft TOs this invoice corresponds to
  remarks?: string;
}

export interface WorksContract {
  id: string;
  agreementId: string;
  contractNo: string; // e.g., "GE/2024/07"
  title: string;
  type: 'GI' | 'LPMit';
  status: 'Active' | 'Completed' | 'Pending';
  startDate?: string;
  endDate?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface Agreement {
  id: string;
  name: string;
  description: string;
  contractSum?: number; // Optional tracking of total contract value
}

export interface FastTrackOpportunity {
  id: string;
  agreementId: string;
  taskName: string;
  potentialRevenue: number;
  actionPlan: string;
}

export interface ExpenditureItem {
  id: string;
  contractId: string;
  category: string;
  taskOrderNo: string;
  description: string;
  approvedValue: number;
  forecastValue: number;
}

export interface GIRequestLimit {
  id: string;
  contractId: string;
  featureRef: string;
  featureType: 'Man-Made' | 'Study Area' | 'Unknown';
  consultant: string;
  toValue: number;
  status: string;
}
