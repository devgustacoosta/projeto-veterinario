# Projeto Veterinário (Frontend)

Este é o frontend do sistema de gerenciamento para clínicas veterinárias. A aplicação oferece painéis distintos para tutores de pets e médicos veterinários, facilitando o agendamento de consultas e o acompanhamento do histórico médico.

## 🌐 Acesso Online

O projeto está disponível em ambiente de produção e pode ser acessado através do link:
[https://projeto-veterinario-kappa.vercel.app](https://projeto-veterinario-kappa.vercel.app)

## 🚀 Tecnologias Utilizadas

- **React 19**
- **Vite**
- **Tailwind CSS 4**
- **React Router DOM**
- **Lucide React** (Ícones)
- **Context API** (Gerenciamento de estado global para Autenticação e Notificações)

## 🌟 Funcionalidades

### Área do Tutor

- **Meus Pets:** Cadastro, edição e remoção dos perfis dos pets.
- **Agendamentos:** Marcação de novas consultas, visualização do histórico, cancelamento e remarcação de horários.

### Painel do Veterinário

- **Agenda:** Controle de horários e registro de atendimentos (diagnóstico, prescrição, observações e peso).
- **Pacientes:** Visualização de todos os pacientes e acesso ao histórico clínico detalhado.
- **Configurações:** Definição de horários de atendimento padrão e bloqueio de agendas (férias, imprevistos, etc.).

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 22.12 ou superior)
- npm, yarn ou pnpm

## 🔧 Como executar o projeto localmente

Siga os passos abaixo para baixar e rodar a aplicação na sua máquina:

1. **Clone o repositório:** `git clone <url-do-repositorio>`
2. **Acesse a pasta do projeto:** `cd projeto-veterinario`
3. **Instale as dependências:** `npm install`
4. **Configure a API:** copie `.env.example` para `.env.local` e ajuste `VITE_API_URL`.
5. **Inicie o servidor de desenvolvimento:** `npm run dev`
6. **Acesse no navegador:** A aplicação estará rodando no endereço `http://localhost:5173`.

## Configuração da API

Copie `.env.example` para `.env.local` e ajuste `VITE_API_URL` para o backend. Reinicie o Vite após alterar a configuração. Para produção, configure essa variável durante o build. A aplicação exige contas reais cadastradas no backend.

O painel financeiro e os valores de procedimentos dependem dos endpoints financeiros e de histórico disponibilizados pelo backend.

## Qualidade e testes

O comando `npm run quality:check` executa formatação, ESLint, testes com cobertura e build. O Vitest bloqueia a execução quando qualquer métrica de cobertura fica abaixo de 100%. `console.log`, `console.error` e demais chamadas de console também são erros de lint.

Para habilitar os hooks do Git neste clone, execute uma vez:

```bash
git config core.hooksPath .githooks
```

Depois disso, `git commit` e `git push` executam a validação automaticamente e são interrompidos ao primeiro erro ou quando a cobertura fica abaixo de 100%. O Git não oferece hooks para comandos somente de consulta, como `git status` ou `git diff`.

```bash
npm run lint
npm run format:check
npm test
npm run test:coverage
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
```

Os testes de navegador iniciam seu próprio Vite na porta 4173 e verificam as telas públicas, a proteção de rotas e a acessibilidade sem simular autenticação. Os testes unitários controlam respostas HTTP para verificar comportamentos do frontend; não comprovam a integração com o backend. A instalação inicial do Chromium pode exigir permissões administrativas para suas bibliotecas de sistema.

A cobertura é gerada em `coverage/lcov.info`. A integração com SonarQube depende da configuração do servidor e das credenciais do ambiente.
