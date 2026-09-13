import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTelemetryDto } from './dto/create-telemetry.dto.js';

@Injectable()
export class AssetsService {
  // Banco de dados simulado em memória
  private assets = [
    { id: 'WT-001', name: 'Aerogerador 01', type: 'WIND_TURBINE', status: 'ONLINE' },
    { id: 'WT-002', name: 'Aerogerador 02', type: 'WIND_TURBINE', status: 'ATTENTION' },
    { id: 'PV-001', name: 'Painel Solar 01', type: 'SOLAR_ARRAY', status: 'ONLINE' },
  ];

  private telemetryData: Record<string, CreateTelemetryDto[]> = {};
  private alerts: any[] = [];
  private alertCounter = 0;

  // ──────────────────────────────────────────────────────────
  // Regra de negócio: classifica temperatura
  // Valores fictícios usados apenas para fins didáticos
  // ──────────────────────────────────────────────────────────
  private classifyTemperature(temperatureC: number): 'NORMAL' | 'WARNING' | 'CRITICAL' {
    if (temperatureC >= 85) return 'CRITICAL';
    if (temperatureC >= 75) return 'WARNING';
    return 'NORMAL';
  }

  // ──────────────────────────────────────────────────────────
  // Assets
  // ──────────────────────────────────────────────────────────
  findAll() {
    return this.assets;
  }

  findOne(id: string) {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) {
      throw new NotFoundException(`Asset com ID "${id}" não foi encontrado.`);
    }
    return asset;
  }

  // ──────────────────────────────────────────────────────────
  // Telemetria
  // ──────────────────────────────────────────────────────────
  addTelemetry(id: string, telemetry: CreateTelemetryDto) {
    this.findOne(id); // Garante que o asset existe — lança 404 se não existir

    // Salva a leitura
    if (!this.telemetryData[id]) {
      this.telemetryData[id] = [];
    }
    this.telemetryData[id].push(telemetry);

    // Classifica a temperatura desta leitura
    const severity = this.classifyTemperature(telemetry.temperatureC);

    // Se for WARNING ou CRITICAL, gera um alerta automaticamente
    if (severity !== 'NORMAL') {
      this.alertCounter += 1;
      this.alerts.push({
        id: `AL-${String(this.alertCounter).padStart(3, '0')}`,
        assetId: id,
        severity,
        type: 'HIGH_TEMPERATURE',
        message:
          severity === 'CRITICAL'
            ? 'Temperatura em nível crítico.'
            : 'Temperatura acima do limite de atenção.',
        timestamp: telemetry.timestamp,
      });
    }

    return { ...telemetry, severity };
  }

  getTelemetry(id: string) {
    this.findOne(id);
    return this.telemetryData[id] || [];
  }

  // ──────────────────────────────────────────────────────────
  // Alertas
  // ──────────────────────────────────────────────────────────
  findAllAlerts() {
    return this.alerts;
  }

  // ──────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────
  getSummary(id: string) {
    this.findOne(id);
    const readings = this.telemetryData[id] || [];
    const assetAlerts = this.alerts.filter(a => a.assetId === id);

    if (readings.length === 0) {
      return {
        assetId: id,
        samples: 0,
        averagePowerMw: null,
        maxTemperatureC: null,
        warningAlerts: 0,
        criticalAlerts: 0,
      };
    }

    const averagePowerMw =
      readings.reduce((sum, r) => sum + r.powerMw, 0) / readings.length;
    const maxTemperatureC = Math.max(...readings.map(r => r.temperatureC));

    return {
      assetId: id,
      samples: readings.length,
      averagePowerMw: Math.round(averagePowerMw * 100) / 100,
      maxTemperatureC,
      warningAlerts: assetAlerts.filter(a => a.severity === 'WARNING').length,
      criticalAlerts: assetAlerts.filter(a => a.severity === 'CRITICAL').length,
    };
  }
}
