import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service.js';
import { CreateTelemetryDto } from './dto/create-telemetry.dto.js';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // ──────────────────────────────────────────────────────────
  // Assets
  // ──────────────────────────────────────────────────────────

  @ApiTags('assets')
  @Get()
  @ApiOperation({
    summary: 'Listar todos os ativos',
    description: 'Retorna a lista completa de ativos de geração renovável cadastrados no sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ativos retornada com sucesso.',
    schema: {
      example: [
        { id: 'WT-001', name: 'Aerogerador 01', type: 'WIND_TURBINE', status: 'ONLINE' },
        { id: 'WT-002', name: 'Aerogerador 02', type: 'WIND_TURBINE', status: 'ATTENTION' },
        { id: 'PV-001', name: 'Painel Solar 01', type: 'SOLAR_ARRAY', status: 'ONLINE' },
      ],
    },
  })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get('summary/fleet')
  getFleetSummary() {
    return this.assetsService.getFleetSummary();
  }

  @ApiTags('assets')
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar ativo por ID',
    description: 'Retorna os dados de um ativo específico. Retorna 404 se o ID não existir.',
  })
  @ApiParam({ name: 'id', description: 'ID do ativo', example: 'WT-001' })
  @ApiResponse({
    status: 200,
    description: 'Ativo encontrado.',
    schema: {
      example: { id: 'WT-001', name: 'Aerogerador 01', type: 'WIND_TURBINE', status: 'ONLINE' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Ativo não encontrado. Verifique o ID informado.',
    schema: { example: { statusCode: 404, message: 'Asset com ID "XYZ" não foi encontrado.', error: 'Not Found' } },
  })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  // ──────────────────────────────────────────────────────────
  // Telemetry
  // ──────────────────────────────────────────────────────────

  @ApiTags('telemetry')
  @Post(':id/telemetry')
  @ApiOperation({
    summary: 'Registrar leitura de telemetria',
    description: `Registra uma leitura de sensor para o ativo informado e aplica a **regra de classificação de temperatura**:

| Temperatura | Resultado | Alerta gerado? |
|-------------|-----------|---------------|
| \`< 75°C\` | NORMAL | ❌ Não |
| \`75°C – 84°C\` | WARNING | ✅ Sim |
| \`≥ 85°C\` | CRITICAL | ✅ Sim |

O campo \`windSpeedMs\` é opcional (painéis solares não possuem vento).`,
  })
  @ApiParam({ name: 'id', description: 'ID do ativo', example: 'WT-001' })
  @ApiBody({ type: CreateTelemetryDto })
  @ApiResponse({
    status: 201,
    description: 'Telemetria registrada. Retorna o registro salvo e informações sobre criação de alerta.',
    schema: {
      example: {
        telemetry: {
          assetId: 'WT-001',
          powerMw: 2.5,
          temperatureC: 80,
          windSpeedMs: 10.2,
          timestamp: '2026-09-13T12:00:00.000Z',
        },
        classification: 'WARNING',
        alertCreated: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido. Verifique os tipos dos campos.',
    schema: {
      example: {
        statusCode: 400,
        message: ['powerMw must be a number conforming to the specified constraints'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Asset não encontrado.' })
  addTelemetry(@Param('id') id: string, @Body() telemetry: CreateTelemetryDto) {
    return this.assetsService.addTelemetry(id, telemetry);
  }

  @ApiTags('telemetry')
  @Get(':id/telemetry')
  @ApiOperation({
    summary: 'Listar leituras de um ativo',
    description: 'Retorna todas as leituras de telemetria registradas para o ativo informado.',
  })
  @ApiParam({ name: 'id', description: 'ID do ativo', example: 'WT-001' })
  @ApiResponse({
    status: 200,
    description: 'Leituras retornadas. Lista vazia se ainda não houver dados.',
    schema: {
      example: [
        { powerMw: 2.5, temperatureC: 70, windSpeedMs: 10.2, timestamp: '2026-09-13T12:00:00.000Z' },
        { powerMw: 2.8, temperatureC: 80, windSpeedMs: 11.0, timestamp: '2026-09-13T13:00:00.000Z' },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Asset não encontrado.' })
  getTelemetry(@Param('id') id: string) {
    return this.assetsService.getTelemetry(id);
  }

  // ──────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────

  @ApiTags('summary')
  @Get(':id/summary')
  @ApiOperation({
    summary: 'Resumo operacional do ativo',
    description: `Retorna métricas agregadas das leituras registradas para o ativo.

**Sem dados:** \`averagePowerMw\` e \`maxTemperatureC\` retornam \`null\` (sem amostras para calcular).`,
  })
  @ApiParam({ name: 'id', description: 'ID do ativo', example: 'WT-001' })
  @ApiResponse({
    status: 200,
    description: 'Resumo calculado com sucesso.',
    schema: {
      example: {
        assetId: 'WT-001',
        samples: 3,
        averagePowerMw: 2.5,
        maxTemperatureC: 90,
        warningAlerts: 1,
        criticalAlerts: 1,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ativo sem dados de telemetria.',
    schema: {
      example: {
        assetId: 'WT-001',
        samples: 0,
        averagePowerMw: null,
        maxTemperatureC: null,
        warningAlerts: 0,
        criticalAlerts: 0,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Asset não encontrado.' })
  getSummary(@Param('id') id: string) {
    return this.assetsService.getSummary(id);
  }

  // ──────────────────────────────────────────────────────────
  // Alertas (Asset)
  // ──────────────────────────────────────────────────────────

  @ApiTags('alerts')
  @Get(':id/alerts')
  @ApiOperation({
    summary: 'Listar alertas do ativo',
    description: 'Retorna os alertas gerados para o ativo específico.',
  })
  @ApiParam({ name: 'id', description: 'ID do ativo', example: 'WT-001' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas do ativo retornada.',
  })
  @ApiResponse({ status: 404, description: 'Asset não encontrado.' })
  getAlerts(@Param('id') id: string) {
    return this.assetsService.findAlertsByAssetId(id);
  }
}
