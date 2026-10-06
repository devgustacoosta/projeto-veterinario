# Plano de implementação — PI-2

## Objetivo e contexto

Evoluir o frontend existente preservando React, Vite, Tailwind e o padrão visual. Referência: relatório do Grupo 5, consultado em 06/10/2026. O backend Flask/MySQL não foi disponibilizado: contratos financeiros precisam de confirmação e implementação no servidor; não substituir persistência real por dados simulados.

## Sequência

- [x] Conferir histórico completo, branches, identidade Git e permissões. Criar branch conforme padrão.
- [x] Centralizar comunicação HTTP; validar configuração, respostas e expiração de sessão. Corrigir CRUD de pets, remarcação, confirmações e estados de carregamento/erro.
- [x] Tornar modais, navegação, notificações e formulários acessíveis: foco, teclado, nomes, contraste, idioma e prevenção de envio repetido.
- [x] Adicionar catálogo de procedimentos, registro financeiro associado ao atendimento, consulta por período do veterinário e valores do atendimento para o tutor.
- [x] Documentar contrato da API, inclusive autorização, validação de valores e preservação de preços históricos.
- [ ] Implementar/confirmar endpoints no repositório Flask e validar integração/persistência real (acesso pendente).
- [x] Adicionar testes unitários/de componente e navegador, com cenários de sucesso, falha HTTP, conflito, teclado e acessibilidade. Não exigir cobertura artificial de 100%.
- [x] Corrigir README, fornecer `.env.example`, configurar execução dos testes e CI, documentar publicação Vercel e dependências do backend.
- [x] Executar lint, testes, build e verificações de navegador. Registrar resultados e limitações.
- [x] Organizar commits com mensagens no padrão observado. Datas devem ser anteriores a 06/10/2026, conforme correção solicitada, e respeitar as janelas (seg–sex 18–22h, sábado 16–20h, America/Sao_Paulo); registrar no diário o instante real de execução quando diferente da data atribuída ao commit.

- [ ] Publicar branch no GitHub: push bloqueado por ausência de autenticação HTTPS; plugin GitHub instalado, mas suas ferramentas não estão disponíveis nesta sessão e o CLI está sem autenticação.

## Critérios de conclusão

- Falhas da API não produzem confirmação de sucesso nem descartam formulários.
- Operações assíncronas têm estado pendente, retorno de erro e recuperação.
- Finanças usam API real com estados vazio/erro; nenhuma alteração de saldo existe apenas no cliente.
- Autorização financeira obrigatória no backend; proteção de rota no frontend não substitui isso.
- Acessibilidade verificada nos fluxos principais, com teste de teclado e análise automatizada.
- Lint, testes e build passam; limitações de integração explicitadas.

## Diário de execução

06/10/2026: plano criado antes de alterações. Clone em `master` no commit `498217b`. Branch `projeto-integrador-II` tem árvore idêntica. Build inicial passou; lint inicial falhou com 8 erros. Backend ainda indisponível. Nenhuma publicação feita nesta etapa.

## Resultado e pendências

Execução real: 06/10/2026, aproximadamente 18h00–18h28 (America/Sao_Paulo). Branch `feature/pi-ii-financas-acessibilidade`. Lint, 26 testes Vitest, build e 9 testes Playwright passaram. Axe não encontrou violações nos cenários verificados; isso não substitui avaliação manual completa. Navegador Chromium obtido por pacote temporário externo ao projeto porque downloads padrão do Playwright falharam neste ambiente. Testes executados com `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/tmp/pi-chromium npm run test:e2e`; CI usa instalação padrão. Revisão visual do módulo financeiro preservou o padrão do projeto.

Datas atribuídas aos commits após correção solicitada em 06/10/2026: planejamento 30/09 18h30; implementação 01/10 19h00; testes 02/10 20h00; documentação 03/10 17h30. Todas são anteriores à data atual e respeitam as janelas de trabalho. Essas datas não coincidem com as etapas futuras de programação (14–18/10) e testes (20–26/10) do Plano de Ação; a execução real permanece registrada acima. Essas datas são organização do histórico, não evidência de execução nesses dias. Identidade Git mantida: Codex, sem assumir identidade do autor do projeto.

Pendências externas: backend Flask/MySQL, validação com o parceiro, testes de segurança/persistência/desempenho, evidências acadêmicas e publicação efetiva do frontend em nuvem. CI configurado, ainda sem resultado remoto. Não houve deploy nem alteração de banco de produção.

## Como retomar

Ler este arquivo, `git status`, histórico e o contrato em `docs/API_FINANCEIRA.md` quando criado. Continuar os itens não concluídos. Não recriar trabalho pronto nem afirmar integração sem testes contra backend.
