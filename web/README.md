# WindOps Web

Frontend do **WindOps Control Center**, criado com Angular 22.1.x. Ele consome a API NestJS do repositório para exibir o panorama da frota de geração renovável, os ativos, a telemetria e os alertas operacionais.

## Funcionalidades

- Dashboard com resumo da frota e alertas recentes
- Listagem de ativos e consulta de detalhes por ativo
- Consulta e registro de telemetria
- Listagem de alertas globais e por ativo
- Tema claro/escuro

## Executar localmente

Na pasta `web`:

```bash
npm install
npm start
```

Abra `http://localhost:4200`. Por padrão, o frontend utiliza a API local em `http://localhost:3000`.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção em `dist/web/browser` |
| `npm test` | Executa os testes unitários configurados com Vitest |

## Configuração da API

- Desenvolvimento: `src/environments/environment.ts` define a URL local da API.
- Produção: `src/environments/environment.prod.ts` recebe `WINDOPS_API_URL` na build do Render, com fallback para a URL pública configurada.
