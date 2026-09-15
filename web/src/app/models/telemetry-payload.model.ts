import { Telemetry } from './telemetry.model';

export interface CreateTelemetry {
  powerMw: number;
  temperatureC: number;
  windSpeedMs?: number;
  timestamp: string;
}

export interface TelemetryResponse {
  telemetry: Telemetry;
  classification: string;
  alertCreated: boolean;
}
