export type StatusCategory = 'approved' | 'submitted' | 'pending' | 'rejected' | 'draft' | 'not-applicable';

export interface ProjectFeature {
  id: string;
  no: number;
  agreement: string;
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
}
