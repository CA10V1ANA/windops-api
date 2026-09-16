import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service.js';
import { NotFoundException } from '@nestjs/common';

describe('AssetsService — Regra de classificação de temperatura', () => {
  let service: AssetsService;

  // Arrange: antes de cada teste, cria uma instância limpa do Service
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetsService],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  // ──────────────────────────────────────────────────────────
  // Testes da regra de temperatura (valores didáticos fictícios)
  // ──────────────────────────────────────────────────────────

  it('70°C deve retornar severity NORMAL e não gerar alerta', () => {
    // Act
    const result = service.addTelemetry('WT-001', {
      powerMw: 2.5,
      temperatureC: 70,
      timestamp: '2026-09-13T12:00:00.000Z',
    });

    // Assert
    expect(result.classification).toBe('NORMAL');
    expect(service.findAllAlerts()).toHaveLength(0);
  });

  it('80°C deve retornar severity WARNING e gerar 1 alerta', () => {
    const result = service.addTelemetry('WT-001', {
      powerMw: 2.5,
      temperatureC: 80,
      timestamp: '2026-09-13T13:00:00.000Z',
    });

    expect(result.classification).toBe('WARNING');
    expect(service.findAllAlerts()).toHaveLength(1);
    expect(service.findAllAlerts()[0].severity).toBe('WARNING');
  });

  it('90°C deve retornar severity CRITICAL e gerar 1 alerta', () => {
    const result = service.addTelemetry('WT-001', {
      powerMw: 2.5,
      temperatureC: 90,
      timestamp: '2026-09-13T14:00:00.000Z',
    });

    expect(result.classification).toBe('CRITICAL');
    expect(service.findAllAlerts()).toHaveLength(1);
    expect(service.findAllAlerts()[0].severity).toBe('CRITICAL');
  });

  it('limite exato de 75°C deve ser WARNING', () => {
    const result = service.addTelemetry('WT-001', {
      powerMw: 2.5,
      temperatureC: 75,
      timestamp: '2026-09-13T15:00:00.000Z',
    });
    expect(result.classification).toBe('WARNING');
  });

  it('limite exato de 85°C deve ser CRITICAL', () => {
    const result = service.addTelemetry('WT-001', {
      powerMw: 2.5,
      temperatureC: 85,
      timestamp: '2026-09-13T16:00:00.000Z',
    });
    expect(result.classification).toBe('CRITICAL');
  });

  // ──────────────────────────────────────────────────────────
  // Testes de asset inexistente
  // ──────────────────────────────────────────────────────────

  it('telemetria para asset inexistente deve lançar NotFoundException', () => {
    expect(() =>
      service.addTelemetry('XYZ-999', {
        powerMw: 2.5,
        temperatureC: 70,
        timestamp: '2026-09-13T12:00:00.000Z',
      }),
    ).toThrow(NotFoundException);
  });

  it('findOne com ID inexistente deve lançar NotFoundException', () => {
    expect(() => service.findOne('FANTASMA-001')).toThrow(NotFoundException);
  });

  // ──────────────────────────────────────────────────────────
  // Testes do summary
  // ──────────────────────────────────────────────────────────

  it('summary sem telemetria deve retornar samples 0 e valores null', () => {
    const summary = service.getSummary('WT-001');
    expect(summary.samples).toBe(0);
    expect(summary.averagePowerMw).toBeNull();
    expect(summary.maxTemperatureC).toBeNull();
  });

  it('summary com dados deve calcular corretamente', () => {
    service.addTelemetry('WT-001', { powerMw: 2.0, temperatureC: 70, timestamp: '2026-09-13T12:00:00.000Z' });
    service.addTelemetry('WT-001', { powerMw: 3.0, temperatureC: 80, timestamp: '2026-09-13T13:00:00.000Z' });

    const summary = service.getSummary('WT-001');
    expect(summary.samples).toBe(2);
    expect(summary.averagePowerMw).toBe(2.5);
    expect(summary.maxTemperatureC).toBe(80);
    expect(summary.warningAlerts).toBe(1);
    expect(summary.criticalAlerts).toBe(0);
  });
});
