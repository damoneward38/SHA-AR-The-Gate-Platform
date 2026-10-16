export interface Location33 {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  color: string;
  type: 'giant_door' | 'anomaly' | 'ancient' | 'vortex';
  freq: number;
  desc: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  acousticSignature?: string;
  status?: 'LOCKED' | 'SURGING' | 'MONITORED';
}

export interface PreparationDay {
  day: string;
  dayNumber: number;
  label: string;
  hz: number;
  color: string;
  remedy: string;
  instructions: string;
  biomarker: string;
}

export interface WhiteLabelTier {
  id: string;
  name: string;
  hebrew: string;
  price: number;
  period: string;
  color: string;
  desc: string;
  features: string[];
  recommended?: boolean;
}

export interface UserSession {
  email: string;
  name: string;
  role: 'director_admin' | 'field_operator' | 'licensee';
  clearance: string;
  phone: string;
  ipOwnership: string;
  token: string;
}

export interface OrderRecord {
  id: string;
  timestamp: string;
  customerEmail: string;
  customerName: string;
  organization: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'CONFIRMED' | 'ACTIVE' | 'PROCESSING';
  licenseKey: string;
  paymentMethod: string;
  phone?: string;
  notes?: string;
}

export interface PipelineAuditReport {
  timestamp: string;
  status: string;
  score: string;
  directorAudit: {
    owner: string;
    phone: string;
    email: string;
    ipStatus: string;
    credentialsVerified: boolean;
  };
  subsystems: Array<{
    name: string;
    route?: string;
    routes?: string[];
    accuracy?: string;
    carrierHz?: number[];
    endToEnd?: string;
    adminSync?: string;
    auditsExecuted?: number;
    deadButtons?: number;
    status: string;
    latencyMs?: number;
  }>;
}
