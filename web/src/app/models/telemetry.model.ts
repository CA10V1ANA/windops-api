export interface Telemetry {
  timestamp: string;
  powerMw: number;
  windSpeedMs: number;
  nacelleTempC: number;
  classification: string;
}
