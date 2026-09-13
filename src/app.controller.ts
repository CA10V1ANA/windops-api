import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Verificar disponibilidade',
    description: 'Retorna o status atual da API. Use para healthcheck de monitoramento.',
  })
  @ApiResponse({
    status: 200,
    description: 'API está no ar e saudável.',
    schema: { example: { status: 'ok' } },
  })
  getHealth() {
    return { status: 'ok' };
  }
}
