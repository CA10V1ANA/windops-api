import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTelemetryDto {
  @ApiProperty({ example: 2.7, description: 'Potência gerada em megawatts' })
  @IsNumber()
  powerMw: number;

  @ApiProperty({ example: 71, description: 'Temperatura da máquina em Celsius' })
  @IsNumber()
  temperatureC: number;

  @ApiPropertyOptional({ example: 11.4, description: 'Velocidade do vento em m/s (opcional)' })
  @IsNumber()
  @IsOptional()
  windSpeedMs?: number;

  @ApiProperty({ example: '2026-09-13T12:00:00.000Z', description: 'Quando a leitura ocorreu (ISO 8601)' })
  @IsDateString()
  timestamp: string;
}
