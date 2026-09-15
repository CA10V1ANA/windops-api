import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from './models/asset.model';
import { Telemetry } from './models/telemetry.model';
import { AssetSummary } from './models/asset-summary.model';
import { CreateTelemetry, TelemetryResponse } from './models/telemetry-payload.model';
import { Alert } from './models/alert.model';
import { FleetSummary } from './models/fleet-summary.model';

export interface HealthResponse {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class WindOpsApiService {
  private http = inject(HttpClient);
  // Como não estamos usando Proxy e habilitamos o CORS, a URL base é absoluta.
  private baseUrl = 'http://localhost:3000';

  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.baseUrl}/assets`);
  }

  getFleetSummary(): Observable<FleetSummary> {
    return this.http.get<FleetSummary>(`${this.baseUrl}/assets/summary/fleet`);
  }

  getAssetById(id: string): Observable<Asset> {
    return this.http.get<Asset>(`${this.baseUrl}/assets/${id}`);
  }

  getAssetTelemetry(id: string): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.baseUrl}/assets/${id}/telemetry`);
  }

  getAssetSummary(id: string): Observable<AssetSummary> {
    return this.http.get<AssetSummary>(`${this.baseUrl}/assets/${id}/summary`);
  }

  postTelemetry(id: string, payload: CreateTelemetry): Observable<TelemetryResponse> {
    return this.http.post<TelemetryResponse>(`${this.baseUrl}/assets/${id}/telemetry`, payload);
  }

  getAssetAlerts(id: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/assets/${id}/alerts`);
  }

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/alerts`);
  }
}
