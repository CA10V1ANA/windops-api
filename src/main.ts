import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Segurança da porta: rejeita dados inválidos antes da regra de negócio
  app.useGlobalPipes(new ValidationPipe());

  // Swagger — contrato público da API
  const config = new DocumentBuilder()
    .setTitle('WindOps API')
    .setDescription(
      `## API de Operação e Alertas para Ativos de Energia Renovável

Centralize e monitore informações operacionais de aerogeradores e painéis solares.

### Funcionalidades
- Listar e consultar ativos cadastrados
- Registrar leituras de telemetria dos sensores
- Classificação automática de temperatura: NORMAL, WARNING, CRITICAL
- Geração automática de alertas
- Resumo operacional por ativo

### Regra de temperatura (valores didáticos)
| Faixa | Severidade |
|-------|-----------|
| \`temperatureC < 75\` | NORMAL |
| \`75 ≤ temperatureC < 85\` | WARNING |
| \`temperatureC ≥ 85\` | CRITICAL |

> **Nota:** Os limites são fictícios e usados apenas para fins de treinamento.`,
    )
    .setVersion('1.0.0')
    .setContact('WindOps Team', '', 'windops@energia.dev')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('health', 'Verificação de disponibilidade da API')
    .addTag('assets', 'Gestão de ativos de geração renovável')
    .addTag('telemetry', 'Leituras de sensores por ativo')
    .addTag('alerts', 'Alertas gerados automaticamente pela regra de temperatura')
    .addTag('summary', 'Resumo operacional agregado por ativo')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
  console.log('📡 WindOps API rodando em http://localhost:3000');
  console.log('📖 Swagger disponível em http://localhost:3000/docs');
}
bootstrap();
