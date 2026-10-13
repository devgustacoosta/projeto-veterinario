# Sistema de Agendamento Veterinário — Frontend

Aplicação web desenvolvida no Projeto Integrador II para conectar tutores e veterinários. O sistema reúne o cadastro de pets, o agendamento de consultas, o acompanhamento clínico e a consulta de valores dos atendimentos em uma interface responsiva, com áreas específicas para cada perfil.

[Acessar o sistema](https://projeto-veterinario-kappa.vercel.app/)

## Funcionalidades

### Tutor

- Cadastro, edição e remoção de pets.
- Agendamento de consultas com escolha de veterinário e horário disponível.
- Consulta, cancelamento e remarcação de agendamentos.
- Visualização dos procedimentos e valores de atendimentos concluídos.

### Veterinário

- Consulta da agenda e criação de agendamentos.
- Registro de diagnóstico, prescrição, observações e peso do paciente.
- Consulta de pacientes e histórico clínico.
- Configuração dos horários de atendimento e bloqueios de disponibilidade.
- Cadastro, edição e inativação de serviços, com preço de referência e custo de materiais.
- Inclusão de procedimentos, quantidades e valores no atendimento.
- Consulta do resumo financeiro por intervalo, com agrupamento diário, mensal ou anual.

### Recursos compartilhados

- Login e cadastro com seleção de perfil.
- Navegação protegida por perfil e encerramento da sessão quando a API retorna autenticação expirada.
- Estados de carregamento, mensagens de erro, novas tentativas e notificações.
- Confirmação de operações e bloqueio de envio repetido durante o salvamento.
- Layout adaptado para computadores e dispositivos móveis.

## Tecnologias

| Área | Ferramentas |
| --- | --- |
| Interface | React 19, React Router e Lucide React |
| Estilos | Tailwind CSS 4 |
| Desenvolvimento e build | Vite 8 |
| Estado compartilhado | Context API para autenticação e notificações |
| Testes de unidade e componentes | Vitest e Testing Library |
| Testes de navegador e acessibilidade | Playwright e axe |
| Análise estática | ESLint |
| Publicação | Vercel |

## Organização do projeto

```text
src/
  components/  Componentes reutilizáveis e diálogos
  context/     Autenticação e notificações
  hooks/       Carregamento de dados e operações por domínio
  layouts/     Estrutura visual e navegação
  lib/         Cliente HTTP, datas e valores monetários
  pages/       Autenticação e telas de tutor e veterinário
tests/         Testes de unidade e componentes
e2e/           Cenários de navegador
```

A comunicação com a API é centralizada e utiliza JSON e token Bearer nas operações autenticadas. O frontend apresenta e valida as entradas; a API controla autorização, persistência e cálculo definitivo dos totais.

## Executar localmente

Utilize Node.js 22.12 ou superior compatível com Vite 8 e npm.

```bash
git clone https://github.com/devgustacoosta/projeto-veterinario.git
cd projeto-veterinario
npm ci
cp .env.example .env.local
```

Configure a URL base da API em `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente `http://localhost:5173`. Login, cadastro e operações com dados dependem da API disponível. Reinicie o servidor de desenvolvimento após alterar a variável de ambiente.

O backend está no [repositório da API](https://github.com/devgustacoosta/projeto-veterinario-backend). Variáveis `VITE_*` são incorporadas ao código público da aplicação e devem conter apenas configurações públicas.

## Testes e qualidade

```bash
npm run quality:check
npm run test:coverage
npx playwright install --with-deps chromium
npm run test:e2e
```

`quality:check` executa ESLint, testes de unidade e componentes e build. A cobertura é gerada em `coverage/`. Os testes com Vitest verificam comunicação HTTP, validação monetária, operações de pets e confirmações assíncronas. Os cenários Playwright verificam fluxos financeiros, recuperação de falhas, foco, teclado e navegação móvel, incluindo verificações automatizadas com axe.

Os testes controlam as respostas da API para reproduzir os cenários. A validação de integração e persistência exige execução com o servidor real. O workflow do GitHub Actions executa lint, testes, build e testes de navegador em pushes e pull requests.

## Acessibilidade

A interface utiliza rótulos de campos, foco visível, notificações semânticas, controle de foco nos diálogos e suporte à navegação por teclado. O menu móvel informa seu estado e a aplicação respeita a preferência por movimento reduzido.

As verificações automatizadas abrangem os estados previstos nos testes. A avaliação completa também deve incluir leitores de tela, zoom, contraste e telas com dados preenchidos. Os controles de remoção de horários e bloqueios têm nomes acessíveis que identificam o registro.

## Build e publicação

```bash
npm run build
npm run preview
```

O build é gerado em `dist/`. Na Vercel, utilize `npm run build` como comando de build, `dist` como diretório de saída e configure `VITE_API_URL` com o endereço HTTPS da API. Alterações nessa variável exigem um novo build.

O arquivo `vercel.json` permite acesso direto às rotas da aplicação. A API deve permitir a origem do frontend por CORS e validar a sessão e as permissões de cada operação.
