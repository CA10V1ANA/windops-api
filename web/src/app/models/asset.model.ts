export type AssetStatus = 'ONLINE' | 'ATTENTION' | 'MAINTENANCE' | 'OFFLINE';

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  ratedPowerMw?: number;
  location?: string;
}
