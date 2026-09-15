import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WindOpsApiService } from '../windops-api.service';
import { Asset } from '../models/asset.model';
import { Telemetry } from '../models/telemetry.model';
import { AssetSummary } from '../models/asset-summary.model';
import { CreateTelemetry } from '../models/telemetry-payload.model';
import { Alert } from '../models/alert.model';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type ActiveTab = 'overview' | 'telemetry' | 'alerts';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.scss',
})
export class AssetDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(WindOpsApiService);

  baseState = signal<LoadState>('idle');
  telemetryState = signal<LoadState>('idle');
  summaryState = signal<LoadState>('idle');
  alertsState = signal<LoadState>('idle');

  asset = signal<Asset | null>(null);
  telemetry = signal<Telemetry[]>([]);
  summary = signal<AssetSummary | null>(null);
  alerts = signal<Alert[]>([]);

  activeTab = signal<ActiveTab>('overview');
  assetId = '';

  // Drawer e Form States
  isDrawerOpen = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccessMsg = signal<string | null>(null);
  
  formData = signal<Partial<CreateTelemetry>>({
    powerMw: undefined,
    temperatureC: undefined,
    windSpeedMs: undefined,
  });

  ngOnInit() {
    this.assetId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.assetId) {
      this.loadBase();
      this.loadTelemetry();
      this.loadSummary();
      this.loadAlerts();
    }
  }

  loadBase() {
    this.baseState.set('loading');
    this.api.getAssetById(this.assetId).subscribe({
      next: (data) => { this.asset.set(data); this.baseState.set('success'); },
      error: () => this.baseState.set('error'),
    });
  }

  loadTelemetry() {
    this.telemetryState.set('loading');
    this.api.getAssetTelemetry(this.assetId).subscribe({
      next: (data) => { this.telemetry.set(data); this.telemetryState.set('success'); },
      error: () => this.telemetryState.set('error'),
    });
  }

  loadSummary() {
    this.summaryState.set('loading');
    this.api.getAssetSummary(this.assetId).subscribe({
      next: (data) => { this.summary.set(data); this.summaryState.set('success'); },
      error: () => this.summaryState.set('error'),
    });
  }

  loadAlerts() {
    this.alertsState.set('loading');
    this.api.getAssetAlerts(this.assetId).subscribe({
      next: (data) => { this.alerts.set(data); this.alertsState.set('success'); },
      error: () => this.alertsState.set('error'),
    });
  }

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
  }

  // Ações do Drawer
  openDrawer() {
    this.submitError.set(null);
    this.submitSuccessMsg.set(null);
    this.formData.set({
      powerMw: undefined,
      temperatureC: undefined,
      windSpeedMs: undefined,
    });
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    if (!this.isSubmitting()) {
      this.isDrawerOpen.set(false);
    }
  }

  submitTelemetry() {
    const data = this.formData();
    if (data.powerMw === undefined || data.temperatureC === undefined) {
      this.submitError.set('Frontend Validation: Power and Temperature are required.');
      return;
    }

    this.submitError.set(null);
    this.submitSuccessMsg.set(null);
    this.isSubmitting.set(true);

    const payload: CreateTelemetry = {
      powerMw: Number(data.powerMw),
      temperatureC: Number(data.temperatureC),
      windSpeedMs: data.windSpeedMs ? Number(data.windSpeedMs) : undefined,
      timestamp: new Date().toISOString()
    };

    this.api.postTelemetry(this.assetId, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.submitSuccessMsg.set(`Telemetry registered. Classification updated to ${res.classification}.`);
        
        // Atualiza as tabelas por trás (sem dar refresh)
        this.loadTelemetry();
        this.loadSummary();
        this.loadAlerts();
        
        setTimeout(() => this.closeDrawer(), 2500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 400) {
          this.submitError.set('API 400: Invalid data format.');
        } else if (err.status === 404) {
          this.submitError.set('API 404: Asset not found.');
        } else {
          this.submitError.set('Network failure: Could not reach WindOps API.');
        }
      }
    });
  }
}
