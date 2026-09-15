import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WindOpsApiService } from './windops-api.service';

type ApiState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private api = inject(WindOpsApiService);
  
  // Estado UI global
  apiState = signal<ApiState>('idle');
  
  // Apenas contagem global (opcional)
  assetsCount = signal(0);
  
  // Controle de tema
  isDarkTheme = signal(false);
  
  ngOnInit() {
    this.checkApiHealth();
    
    // Podemos manter uma chamada simples só para pegar a contagem para a Rail
    this.api.getAssets().subscribe({
      next: (data) => this.assetsCount.set(data.length)
    });
  }

  checkApiHealth() {
    this.apiState.set('loading');
    this.api.checkHealth().subscribe({
      next: (res) => {
        if (res.status === 'ok') this.apiState.set('success');
        else this.apiState.set('error');
      },
      error: () => this.apiState.set('error')
    });
  }

  toggleTheme() {
    this.isDarkTheme.update(v => !v);
    if (this.isDarkTheme()) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
