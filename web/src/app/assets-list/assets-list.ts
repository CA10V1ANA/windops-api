import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Asset } from '../models/asset.model';
import { WindOpsApiService } from '../windops-api.service';

type ApiState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <header class="section-header">
      <h2>Inventário de Ativos</h2>
    </header>

    @if (assetsState() === 'loading') {
      <div class="empty-state">Carregando dados operacionais...</div>
    } @else if (assetsState() === 'error') {
      <div class="empty-state" style="color: var(--status-critical);">
        Não foi possível carregar os ativos. <br><br>
        <button class="btn-primary" (click)="loadAssets()">Tentar Novamente</button>
      </div>
    } @else {
      <!-- Tabela de Alta Densidade -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Localização</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          @for (asset of assets(); track asset.id) {
            <tr>
              <td class="mono-text">{{ asset.id }}</td>
              <td>{{ asset.name }}</td>
              <td>{{ asset.type.replace('_', ' ') }}</td>
              <td>
                <span class="status-badge" [ngClass]="asset.status.toLowerCase()">
                  <span class="dot"></span> {{ asset.status }}
                </span>
              </td>
              <td>{{ asset.location || 'N/D' }}</td>
              <td>
                <a [routerLink]="['/assets', asset.id]" class="btn-primary" style="text-decoration: none; display: inline-block; line-height: 32px;">Detalhes</a>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="empty-state">Nenhum ativo encontrado.</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `
})
export class AssetsList implements OnInit {
  private api = inject(WindOpsApiService);
  
  assetsState = signal<ApiState>('idle');
  assets = signal<Asset[]>([]);
  
  ngOnInit() {
    this.loadAssets();
  }

  loadAssets() {
    this.assetsState.set('loading');
    this.api.getAssets().subscribe({
      next: (data) => {
        this.assets.set(data);
        this.assetsState.set('success');
      },
      error: (err) => {
        console.error('Erro ao carregar assets', err);
        this.assetsState.set('error');
      }
    });
  }
}
