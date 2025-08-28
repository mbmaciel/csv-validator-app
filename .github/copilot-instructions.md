# Copilot Instructions for csv-validator-login

## Visão Geral
Este projeto é um validador de cálculos para arquivos CSV, com arquitetura dividida em frontend (React, pasta `src/`) e backend (Node.js/Express, pasta `server/`). O fluxo principal envolve upload de arquivos CSV, validação e exibição dos resultados.

## Componentes Principais
- **Frontend (`src/`)**: React, com componentes para upload, visualização de tabelas, autenticação e seleção de operadora. Exemplos:
  - `components/FileUpload.jsx`: Upload de arquivos CSV
  - `components/CsvTable.jsx`: Exibição dos dados validados
  - `context/AuthContext.jsx`: Gerenciamento de autenticação
  - `utils/csvParser.js`: Parsing de arquivos CSV
- **Backend (`server/`)**: Node.js/Express, responsável por receber uploads, processar arquivos e servir dados validados. Arquivo principal: `server/server.js`.
- **Arquivos CSV**: Guardados em `server/files/`.

## Fluxo de Dados
1. Usuário faz upload de CSV pelo frontend
2. Frontend envia arquivo para backend (`server/server.js`)
3. Backend processa e valida o arquivo, salva em `server/files/`
4. Resultados são retornados ao frontend para exibição

## Convenções e Padrões
- **Validação de CSV**: Use sempre o utilitário de parsing em `src/utils/csvParser.js` para garantir consistência.
- **Autenticação**: Contexto de autenticação centralizado em `src/context/AuthContext.jsx`.
- **Seleção de Operadora**: Contexto em `src/context/OperadoraContext.jsx`.
- **Rotas Privadas**: Utilize `components/PrivateRoute.jsx` para proteger páginas.
- **Estilo**: CSS modular em `src/App.css` e `src/index.css`.

## Workflows de Desenvolvimento
- **Iniciar Frontend**: `npm start` na raiz
- **Iniciar Backend**: `npm start` em `server/`
- **Testes**: Testes do frontend em `src/App.test.js` (Jest)
- **Debug**: Use logs no backend (`console.log` em `server/server.js`) e React DevTools no frontend

## Integrações e Dependências
- **React**: Interface do usuário
- **Express**: API backend
- **Bibliotecas CSV**: Utilizadas em `csvParser.js` e possivelmente no backend

## Exemplos de Padrões
- Upload de arquivo: `FileUpload.jsx` → API backend → `server/files/`
- Validação: `csvParser.js` → lógica backend
- Autenticação: `AuthContext.jsx` → rotas protegidas

## Recomendações para Agentes
- Sempre utilize os utilitários e contextos existentes para parsing, autenticação e seleção de operadora
- Mantenha a separação clara entre frontend e backend
- Siga os fluxos de upload e validação já implementados
- Consulte arquivos de contexto para padrões de estado global

---
Seções incompletas ou dúvidas? Solicite exemplos ou esclarecimentos ao usuário.
