# ⚡ WindOps Control Center (Fullstack)

> Sistema Completo de Operação e Alertas para Ativos de Energia Renovável  
> **Stack Backend:** NestJS · TypeScript · Swagger/OpenAPI  
> **Stack Frontend:** Angular 16+ · Signals · SCSS · Componentes Responsivos  
> **Projeto pedagógico** — Desafio Individual Fullstack · Hackathon Proenergia Summit 2026

---

## 📋 Sobre o projeto

O **WindOps Control Center** é a evolução da WindOps API. Ele engloba tanto o motor de regras de negócio (Backend) quanto o painel de operação (Frontend), centralizando informações vitais de ativos de geração renovável (aerogeradores e painéis solares).

**Funcionalidades:**
- **Backend (NestJS):**
  - Registro de telemetria dos sensores e classificação de temperatura (NORMAL, WARNING, CRITICAL)
  - Geração automática de alertas
  - Resumo operacional da frota
- **Frontend (Angular):**
  - Painel (Dashboard) com contagem de ativos
  - Inventário responsivo de ativos com badges dinâmicas
  - Tela de detalhes por ativo consumindo telemetria
  - Tema Claro e Escuro (Dark Mode) com toggle animado

> **Nota:** Os limites de temperatura e os dados são fictícios, usados apenas para fins didáticos.

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
```

### Rodando o Backend (API)
Acesse a raiz do projeto para rodar a API NestJS:
```bash
# Instale as dependências
npm install

# Inicie o servidor em modo desenvolvimento
npm run start:dev
```
A API rodará em **http://localhost:3000** (Documentação Swagger em `/docs`).

### Rodando o Frontend (Web)
Abra um novo terminal e navegue até a pasta `web`:
```bash
cd web

# Instale as dependências do Angular
npm install

# Inicie a aplicação Angular
npm start
```
O Frontend rodará em **http://localhost:4200**.

---

## ☁️ Deploy no Render.com (Infrastructure as Code)

O projeto está pronto para ser publicado em nuvem de forma gratuita utilizando o Render.com com a estratégia de Infrastructure as Code (arquivo `render.yaml`).

1. Conecte este repositório no seu painel do Render (Dashboard > Blueprints).
2. O Render lerá o arquivo `render.yaml` e provisionará automaticamente dois serviços:
   - **WindOps API**: Web Service (Node) rodando o backend NestJS.
   - **WindOps Web**: Static Site rodando a build do Angular.
3. A URL da API é repassada automaticamente para o Angular através do `environment.prod.ts`.

---

## 🏗️ Arquitetura

O projeto adota uma arquitetura client-server clássica:

```
[ Usuário / Navegador ]
         │
         ▼ (HTTP)
[ Frontend Angular ] (Signals, SCSS, RxJS HttpClient)
         │
         ▼ (REST API / JSON)
[ Backend NestJS ] (Controllers, Services, DTOs + Validation)
```

### Estrutura do Monorepo (Simplificado)

```text
/
├── render.yaml                 # Receita de Deploy para o Render
├── src/                        # Código fonte do Backend NestJS
│   ├── assets/                 # Módulo de Ativos e Telemetria
│   ├── alerts/                 # Módulo de Alertas
│   └── main.ts                 # Configuração do CORS e Swagger
└── web/                        # Código fonte do Frontend Angular
    ├── src/
    │   ├── app/                # Componentes (Dashboard, Assets-List, Asset-Detail)
    │   ├── environments/       # Configuração de URL da API (Dev vs Prod)
    │   ├── styles.scss         # Variáveis CSS e Design System
    │   └── index.html          # Favicon de Turbina e Título
    └── angular.json            # Configuração de Build do Frontend
```

---

## 👨‍💻 Desenvolvido com

- [NestJS](https://nestjs.com/) — Framework Node.js progressivo
- [Angular](https://angular.io/) — SPA Framework (Utilizando Signals)
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática
- [Swagger/OpenAPI](https://swagger.io/) — Documentação automática
- [Render](https://render.com/) — Cloud Hosting
