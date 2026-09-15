export interface Alert {
  id: string;
  assetId: string;
  severity: 'WARNING' | 'CRITICAL';
  type: string;
  message: string;
  timestamp: string;
}
