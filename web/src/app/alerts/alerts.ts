import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WindOpsApiService } from '../windops-api.service';
import { Alert } from '../models/alert.model';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="page-header">
      <div class="header-main">
        <div>
          <h1 class="asset-title">Alertas Ativos</h1>
          <div class="header-meta">
            <span>Eventos Operacionais de Atenção e Críticos</span>
          </div>
        </div>
      </div>
    </header>

    @if (alertsState() === 'loading') {
      <div class="skeleton-block" style="width: 100%; height: 300px;"></div>
    } @else if (alertsState() === 'error') {
      <div class="error-state">
        <p><strong>Não foi possível carregar os alertas</strong></p>
        <button class="btn-primary" (click)="loadAlerts()">Tentar Novamente</button>
      </div>
    } @else if (alerts().length === 0) {
      <div class="empty-state">
        <p>Nenhum alerta operacional registrado na frota.</p>
      </div>
    } @else {
      <table class="data-table">
        <thead>
          <tr>
            <th>ID do Alerta</th>
            <th>Ativo</th>
            <th>Severidade</th>
            <th>Tipo</th>
            <th>Mensagem</th>
            <th>Horário</th>
          </tr>
        </thead>
        <tbody>
          @for (alert of alerts(); track alert.id) {
            <tr>
              <td class="mono-text">{{ alert.id }}</td>
              <td class="mono-text"><a [routerLink]="['/assets', alert.assetId]" class="breadcrumb-link">{{ alert.assetId }}</a></td>
              <td>
                <span class="status-badge" [ngClass]="alert.severity.toLowerCase()">
                  <span class="dot"></span>{{ alert.severity }}
                </span>
              </td>
              <td>{{ alert.type.replace('_', ' ') }}</td>
              <td>{{ alert.message }}</td>
              <td class="mono-text">{{ alert.timestamp }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `
})
export class AlertsComponent implements OnInit {
  private api = inject(WindOpsApiService);
  
  alertsState = signal<LoadState>('idle');
  alerts = signal<Alert[]>([]);

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.alertsState.set('loading');
    this.api.getAlerts().subscribe({
      next: (data) => {
        this.alerts.set(data);
        this.alertsState.set('success');
      },
      error: () => this.alertsState.set('error')
    });
  }
}
