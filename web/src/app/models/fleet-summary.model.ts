import { Alert } from './alert.model';

export interface FleetSummary {
  totalAssets: number;
  statusDistribution: {
    online: number;
    attention: number;
    critical: number;
    offline: number;
  };
  totalPowerMw: number;
  activeAlertsCount: number;
  recentAlerts: Alert[];
}
