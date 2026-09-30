# Plano de implementação — PI-2

## Objetivo e contexto

Evoluir o frontend existente preservando React, Vite, Tailwind e o padrão visual. Referência: relatório do Grupo 5, consultado em 06/10/2026. O backend Flask/MySQL não foi disponibilizado: contratos financeiros precisam de confirmação e implementação no servidor; não substituir persistência real por dados simulados.

## Sequência

- [ ] Conferir histórico completo, branches, identidade Git e permissões. Criar branch conforme padrão.
- [ ] Centralizar comunicação HTTP; validar configuração, respostas e expiração de sessão. Corrigir CRUD de pets, remarcação, confirmações e estados de carregamento/erro.
- [ ] Tornar modais, navegação, notificações e formulários acessíveis: foco, teclado, nomes, contraste, idioma e prevenção de envio repetido.
- [ ] Adicionar catálogo de procedimentos, registro financeiro associado ao atendimento, consulta por período do veterinário e valores do atendimento para o tutor.
- [ ] Documentar contrato da API, inclusive autorização, validação de valores e preservação de preços históricos. Validar integração quando houver backend.
- [ ] Adicionar testes unitários/de componente e navegador, com cenários de sucesso, falha HTTP, conflito, teclado e acessibilidade. Não exigir cobertura artificial de 100%.
- [ ] Corrigir README, fornecer `.env.example`, configurar execução dos testes e CI, documentar publicação Vercel e dependências do backend.
- [ ] Executar lint, testes, build e verificações de navegador. Registrar resultados e limitações.
- [ ] Organizar commits com mensagens no padrão observado. Datas devem seguir o Plano de Ação e janelas solicitadas (seg–sex 18–22h, sábado 16–20h, America/Sao_Paulo); registrar no diário o instante real de execução quando diferente da data atribuída ao commit.

## Critérios de conclusão

- Falhas da API não produzem confirmação de sucesso nem descartam formulários.
- Operações assíncronas têm estado pendente, retorno de erro e recuperação.
- Finanças usam API real com estados vazio/erro; nenhuma alteração de saldo existe apenas no cliente.
- Autorização financeira obrigatória no backend; proteção de rota no frontend não substitui isso.
- Acessibilidade verificada nos fluxos principais, com teste de teclado e análise automatizada.
- Lint, testes e build passam; limitações de integração explicitadas.

## Diário de execução

06/10/2026: plano criado antes de alterações. Clone em `master` no commit `498217b`. Branch `projeto-integrador-II` tem árvore idêntica. Build inicial passou; lint inicial falhou com 8 erros. Backend ainda indisponível. Nenhuma publicação autorizada implicitamente por este plano.

## Como retomar

Ler este arquivo, `git status`, histórico e o contrato em `docs/API_FINANCEIRA.md` quando criado. Continuar os itens não concluídos. Não recriar trabalho pronto nem afirmar integração sem testes contra backend.
