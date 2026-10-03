# Contrato financeiro proposto — frontend PI II

Este documento especifica os endpoints consumidos pelo novo frontend. Não confirma existência ou compatibilidade do backend atual. Confirmar nomes, migrações e regras no repositório Flask. Preservar endpoints anteriores de pets, agenda, histórico e configurações.

Todas as requisições autenticadas usam `Authorization: Bearer <JWT>`. JSON UTF-8; respostas de erro `{ "erro": "mensagem" }`. 400/422 validação; 401 JWT expirado/inválido (frontend encerra sessão); 403 acesso proibido; 404 recurso inexistente; 409 conflito; 500 falha interna. Não devolver detalhes de SQL ou informações de terceiros.

## Catálogo do veterinário

`GET /vet/servicos` retorna array (inclui inativos):

```json
[{"id":1,"descricao":"Consulta","tipo":"consulta","preco_referencia":"125.50","custo_material":"10.00","ativo":true}]
```

`POST /vet/servicos` (201) e `PUT /vet/servicos/{id}` (200 ou 204) recebem os campos acima, exceto id. Tipo: `consulta`, `exame`, `procedimento`, `outro`. Descrição não vazia, máximo 150 caracteres. Valores não negativos, máximo 9999999.99, no máximo duas casas; preferir strings decimais. Ativo booleano. Veterinário só administra seu catálogo. Não excluir serviços referenciados por histórico; inativar.

## Registro clínico e financeiro atômico

Extensão de `POST /vet/agendamentos/{id}/historico`:

```json
{"diagnostico":"Avaliação","prescricao":"Orientações","observacoes":"Retorno","peso_kg":4.2,"procedimentos":[{"servico_id":1,"quantidade":2,"valor_unitario":"125.50"}]}
```

`procedimentos` opcional mantém compatibilidade com registros clínicos sem valores. Array vazio significa nenhum valor. O frontend não envia total confiável. Servidor valida atendimento do veterinário logado e serviço ativo do próprio catálogo, quantidade inteira 1–1000, valor válido; calcula subtotal e total com Decimal, nunca float. Concluir atendimento e gravar histórico/itens na mesma transação; rollback integral em erro. Repetição/conflito retorna 409 sem duplicação. Proteger concorrência e aplicar limite de itens/tamanho de payload no servidor.

Guardar nos itens: agendamento/histórico, serviço, descrição/tipo copiados, quantidade, valor unitário praticado, custo unitário histórico, subtotal e data. Preço praticado pode diferir da referência, conforme política do parceiro. Alterar/inativar catálogo não pode alterar atendimentos já registrados. Valores ausentes em dados do PI I não equivalem a pagamento zero: resposta de consulta deve indicar itens vazios.

## Resumo do veterinário

`GET /vet/financeiro?inicio=2026-10-01&fim=2026-10-31&agrupamento=dia`

`inicio/fim` obrigatórios `YYYY-MM-DD`, início <= fim; agrupar `dia`, `mes`, `ano`. Definir fuso de negócio `America/Sao_Paulo` e incluir início às 00:00 até próximo dia do fim (limite superior exclusivo). Somente atendimentos concluídos do veterinário; excluir cancelados. Servidor calcula agregados com Decimal. Para grande volume, estabelecer paginação e adequar frontend antes de limitar silenciosamente o array.

```json
{"total":"251.00","atendimentos":[{"agendamento_id":7,"data_hora":"2026-10-06 19:00:00","pet_nome":"Luna","tutor_nome":"Tutor","total":"251.00"}],"periodos":[{"periodo":"2026-10-06","total":"251.00"}]}
```

Períodos ordenados; rótulos `YYYY-MM-DD`, `YYYY-MM`, `YYYY`. Vazio: total `"0.00"`, arrays vazios. Receita de serviços não comprova quitação; pagamentos/contas a receber não fazem parte deste contrato.

## Valores para o tutor

`GET /tutor/agendamentos/{id}/financeiro`:

```json
{"total":"251.00","procedimentos":[{"id":9,"descricao":"Consulta","quantidade":2,"valor_unitario":"125.50","subtotal":"251.00"}]}
```

Verificar no banco que agendamento pertence ao tutor do JWT, inclusive tentativas de trocar id na URL. Não aceitar ids de tutor/veterinário enviados pelo cliente como autorização. Somente leitura; não expor custo interno ou receita de outros tutores. Histórico sem preços retorna total `"0.00"` e itens vazios. Definir resposta para atendimento não concluído (409 recomendado).

## Migração e validação pendentes no Flask

1. Migração versionada para catálogo + itens financeiros com chaves estrangeiras, DECIMAL e índices por veterinário/data. Não alterar dados anteriores nem recalcular preços antigos.
2. JWT, autorização por recurso, validação de catálogo, transação e concorrência.
3. Testes de API e banco: totais, arredondamento, limite de datas, histórico preservado, acesso cruzado negado, repetição sem duplicação e rollback.
4. Integrar frontend contra ambiente de teste real e confirmar persistência após reload.

Testes Playwright deste repositório usam respostas interceptadas e não satisfazem esses itens de backend.
