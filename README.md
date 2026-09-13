# ⚡ WindOps API

> API de Operação e Alertas para Ativos de Energia Renovável  
> **Stack:** NestJS · TypeScript · Swagger/OpenAPI  
> **Projeto pedagógico** — Desafio Individual #3 · Hackathon Proenergia Summit 2026

---

## 📋 Sobre o projeto

A **WindOps API** centraliza informações operacionais de ativos de geração renovável (aerogeradores e painéis solares). Ela permite:

- Listar e consultar ativos cadastrados
- Registrar leituras de telemetria dos sensores
- Classificar automaticamente a temperatura em **NORMAL**, **WARNING** ou **CRITICAL**
- Gerar alertas automaticamente quando há risco
- Consultar resumos operacionais por ativo

> **Nota:** Os limites de temperatura são fictícios e usados apenas para fins didáticos.

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js v18+
- npm v9+

### Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd windops-api

# Instale as dependências
npm install

# Inicie o servidor em modo desenvolvimento (hot reload)
npm run start:dev
```

O servidor sobe em **http://localhost:3000**

---

## 📖 Swagger / Documentação Interativa

Acesse a documentação completa da API com todos os endpoints, exemplos e campos:

```
http://localhost:3000/docs
```

Você pode testar as rotas diretamente pelo navegador, sem precisar de Postman ou curl.

---

## 📡 Endpoints do MVP

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica se a API está no ar |
| `GET` | `/assets` | Lista todos os ativos |
| `GET` | `/assets/:id` | Busca um ativo por ID (404 se não existir) |
| `POST` | `/assets/:id/telemetry` | Registra uma leitura de telemetria |
| `GET` | `/assets/:id/telemetry` | Lista leituras de um ativo |
| `GET` | `/assets/:id/summary` | Resumo operacional de um ativo |
| `GET` | `/alerts` | Lista todos os alertas gerados |

---

## 🔧 Exemplos de uso

### Verificar saúde da API

```bash
curl http://localhost:3000/health
# { "status": "ok" }
```

### Listar ativos

```bash
curl http://localhost:3000/assets
```

### Registrar telemetria (gera alerta WARNING)

```bash
curl -X POST http://localhost:3000/assets/WT-001/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "powerMw": 2.5,
    "temperatureC": 80,
    "windSpeedMs": 10.2,
    "timestamp": "2026-09-13T12:00:00.000Z"
  }'
```

Resposta:
```json
{
  "powerMw": 2.5,
  "temperatureC": 80,
  "windSpeedMs": 10.2,
  "timestamp": "2026-09-13T12:00:00.000Z",
  "severity": "WARNING"
}
```

### Registrar telemetria inválida (deve retornar 400)

```bash
curl -X POST http://localhost:3000/assets/WT-001/telemetry \
  -H "Content-Type: application/json" \
  -d '{ "powerMw": "muito", "temperatureC": "quente" }'
# HTTP 400 Bad Request
```

### Buscar asset inexistente (deve retornar 404)

```bash
curl http://localhost:3000/assets/FANTASMA-001
# HTTP 404 Not Found
```

### Consultar alertas gerados

```bash
curl http://localhost:3000/alerts
```

### Consultar resumo de um ativo

```bash
curl http://localhost:3000/assets/WT-001/summary
```

Resposta com dados:
```json
{
  "assetId": "WT-001",
  "samples": 3,
  "averagePowerMw": 2.5,
  "maxTemperatureC": 90,
  "warningAlerts": 1,
  "criticalAlerts": 1
}
```

---

## 🧠 Regra de negócio (valores didáticos)

| Temperatura | Classificação | Alerta gerado? |
|-------------|---------------|---------------|
| `< 75°C` | `NORMAL` | ❌ Não |
| `75°C a 84°C` | `WARNING` | ✅ Sim |
| `>= 85°C` | `CRITICAL` | ✅ Sim |

---

## 🏗️ Arquitetura

```
HTTP Request
    ↓
Controller       ← recebe a requisição, delega ao Service
    ↓
DTO + ValidationPipe  ← valida o payload (400 se inválido)
    ↓
Service          ← regra de negócio, classificação, alertas
    ↓
Dados em memória ← arrays (sem banco por ora)
    ↓
HTTP Response
```

### Estrutura de pastas

```
src/
├── assets/
│   ├── dto/
│   │   └── create-telemetry.dto.ts   # Contrato de entrada da telemetria
│   ├── assets.controller.ts          # Rotas HTTP de assets e telemetria
│   ├── assets.service.ts             # Regra de negócio, alertas, summary
│   └── assets.module.ts              # Módulo NestJS
├── alerts/
│   ├── alerts.controller.ts          # Rota GET /alerts
│   └── alerts.module.ts
├── app.module.ts                     # Módulo raiz
└── main.ts                           # Ponto de entrada, Swagger, ValidationPipe
```

---

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Modo watch (re-executa ao salvar)
npm run test:watch
```

Cobertura dos testes:
- ✅ `70°C → NORMAL`
- ✅ `80°C → WARNING` + geração de alerta
- ✅ `90°C → CRITICAL` + geração de alerta
- ✅ Limites exatos (75°C e 85°C)
- ✅ Asset inexistente → `NotFoundException`
- ✅ Summary sem telemetria (retorna `null`)
- ✅ Summary com dados (média, máximo, contagem de alertas)
- ✅ `GET /health → { status: "ok" }`

---

## 🏗️ Build de produção

```bash
npm run build
```

---

## 📌 Ativos pré-cadastrados

| ID | Nome | Tipo | Status |
|----|------|------|--------|
| `WT-001` | Aerogerador 01 | `WIND_TURBINE` | `ONLINE` |
| `WT-002` | Aerogerador 02 | `WIND_TURBINE` | `ATTENTION` |
| `PV-001` | Painel Solar 01 | `SOLAR_ARRAY` | `ONLINE` |

---

## 🔮 Próximos passos (fora do MVP)

- [ ] `POST /assets` — Cadastrar novos ativos
- [ ] `PATCH /assets/:id/status` — Atualizar status
- [ ] Filtros: `GET /assets?status=ONLINE&type=WIND_TURBINE`
- [ ] Filtros: `GET /alerts?severity=CRITICAL&assetId=WT-001`
- [ ] Persistência com **Prisma + PostgreSQL/Neon**
- [ ] Testes e2e
- [ ] Logs estruturados

---

## 👨‍💻 Desenvolvido com

- [NestJS](https://nestjs.com/) — Framework Node.js progressivo
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática
- [class-validator](https://github.com/typestack/class-validator) — Validação de DTOs
- [Swagger/OpenAPI](https://swagger.io/) — Documentação automática
- [Vitest](https://vitest.dev/) — Testes unitários
