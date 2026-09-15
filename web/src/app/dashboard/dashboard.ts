import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WindOpsApiService } from '../windops-api.service';
import { FleetSummary } from '../models/fleet-summary.model';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .kpi-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .kpi-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .kpi-value {
      font-size: 32px;
      font-weight: 600;
      font-family: var(--font-mono);
      line-height: 1;
    }

    .kpi-value.critical { color: var(--status-critical); }
    .kpi-value.warning { color: var(--status-warning); }

    .health-bar {
      display: flex;
      height: 24px;
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      margin: 16px 0;
      background-color: var(--bg-canvas);
    }
    
    .health-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 600;
    }
    
    .health-segment.online { background-color: var(--status-success); }
    .health-segment.attention { background-color: var(--status-warning); }
    .health-segment.critical { background-color: var(--status-critical); }
    .health-segment.offline { background-color: var(--status-offline); }
    
    .legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .legend-dot.online { background-color: var(--status-success); }
    .legend-dot.attention { background-color: var(--status-warning); }
    .legend-dot.critical { background-color: var(--status-critical); }
    
    .panel {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      padding: 24px;
    }
  `],
  template: `
    <header class="section-header">
      <h2>Painel de Comando Operacional</h2>
    </header>

    @if (state() === 'loading') {
      <div class="skeleton-block" style="width: 100%; height: 200px;"></div>
    } @else if (state() === 'error') {
      <div class="error-state">
        <p><strong>Não foi possível carregar o Dashboard</strong></p>
        <button class="btn-primary" (click)="loadDashboard()">Tentar Novamente</button>
      </div>
    } @else if (summary()) {
      <div class="dashboard-grid">
        <div class="kpi-card">
          <span class="kpi-label">Geração Total</span>
          <span class="kpi-value">{{ summary()!.totalPowerMw.toFixed(1) }} <span style="font-size: 16px; color: var(--text-secondary);">MW</span></span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Ativos Conectados</span>
          <span class="kpi-value">{{ summary()!.totalAssets }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Alertas Críticos Ativos</span>
          <span class="kpi-value" [class.critical]="summary()!.statusDistribution.critical > 0">
            {{ summary()!.statusDistribution.critical }}
          </span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Alertas de Atenção</span>
          <span class="kpi-value" [class.warning]="summary()!.statusDistribution.attention > 0">
            {{ summary()!.statusDistribution.attention }}
          </span>
        </div>
      </div>

      <div class="panel">
        <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Saúde da Frota</h3>
        <p style="font-size: 13px; color: var(--text-secondary);">Distribuição de status dos aerogeradores em tempo real.</p>
        
        <div class="health-bar">
          @if (summary()!.statusDistribution.online > 0) {
            <div class="health-segment online" [style.width.%]="(summary()!.statusDistribution.online / summary()!.totalAssets) * 100">
              {{ summary()!.statusDistribution.online }}
            </div>
          }
          @if (summary()!.statusDistribution.attention > 0) {
            <div class="health-segment attention" [style.width.%]="(summary()!.statusDistribution.attention / summary()!.totalAssets) * 100">
              {{ summary()!.statusDistribution.attention }}
            </div>
          }
          @if (summary()!.statusDistribution.critical > 0) {
            <div class="health-segment critical" [style.width.%]="(summary()!.statusDistribution.critical / summary()!.totalAssets) * 100">
              {{ summary()!.statusDistribution.critical }}
            </div>
          }
        </div>
        
        <div class="legend">
          <div class="legend-item"><span class="legend-dot online"></span> Operação Normal</div>
          <div class="legend-item"><span class="legend-dot attention"></span> Requer Atenção</div>
          <div class="legend-item"><span class="legend-dot critical"></span> Condição Crítica</div>
        </div>
      </div>

      @if (summary()!.recentAlerts.length > 0) {
        <div class="panel" style="margin-top: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 16px;">Ocorrências Recentes</h3>
          <table class="data-table" style="border: none;">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ativo</th>
                <th>Severidade</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              @for (alert of summary()!.recentAlerts; track alert.id) {
                <tr>
                  <td class="mono-text">{{ alert.id }}</td>
                  <td class="mono-text"><a [routerLink]="['/assets', alert.assetId]" class="breadcrumb-link">{{ alert.assetId }}</a></td>
                  <td>
                    <span class="status-badge" [ngClass]="alert.severity.toLowerCase()">
                      <span class="dot"></span>{{ alert.severity }}
                    </span>
                  </td>
                  <td>{{ alert.message }}</td>
                </tr>
              }
            </tbody>
          </table>
          <div style="margin-top: 16px;">
            <a routerLink="/alerts" class="btn-link">Ver todos os alertas &rarr;</a>
          </div>
        </div>
      }
    }
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(WindOpsApiService);
  
  state = signal<LoadState>('idle');
  summary = signal<FleetSummary | null>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.state.set('loading');
    this.api.getFleetSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.state.set('success');
      },
      error: () => this.state.set('error')
    });
  }
}
