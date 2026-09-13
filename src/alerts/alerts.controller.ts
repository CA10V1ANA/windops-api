import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssetsService } from '../assets/assets.service.js';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os alertas',
    description: `Retorna todos os alertas gerados automaticamente pela regra de temperatura.

Alertas são criados quando a telemetria registra temperatura **WARNING (≥75°C)** ou **CRITICAL (≥85°C)**.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas retornada. Vazia se nenhum alerta foi gerado.',
    schema: {
      example: [
        {
          id: 'AL-001',
          assetId: 'WT-001',
          severity: 'WARNING',
          type: 'HIGH_TEMPERATURE',
          message: 'Temperatura acima do limite de atenção.',
          timestamp: '2026-09-13T12:00:00.000Z',
        },
        {
          id: 'AL-002',
          assetId: 'WT-001',
          severity: 'CRITICAL',
          type: 'HIGH_TEMPERATURE',
          message: 'Temperatura em nível crítico.',
          timestamp: '2026-09-13T13:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.assetsService.findAllAlerts();
  }
}
