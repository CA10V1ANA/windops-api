export interface AssetSummary {
  assetId: string;
  samples: number;
  averagePowerMw: number | null;
  maxTemperatureC: number | null;
  warningAlerts: number;
  criticalAlerts: number;
}
