# Perguntas abertas — antes de gerar o prompt

> Lacunas encontradas cruzando briefing + 4 PDFs + site + Instagram.
> Marcadas como **BLOQUEIA** (precisa de resposta antes do prompt virar preview),
> **IMPORTANTE** (dá para assumir default, mas o cliente deve confirmar) e
> **DEPOIS** (resolve na rodada de ajuste).

## Identidade e canal

- **P1 — BLOQUEIA. Nome da assistente.** O briefing responde só "Assistente da Telhas Barreiro",
  sem nome próprio. Sem nome, a IA não tem como se apresentar com naturalidade nem assinar.
  Default proposto se não houver resposta: usar apenas "assistente da Telhas Barreiro".
- **P2 — IMPORTANTE. Horário.** Briefing diz 07h30 às 17h. O site diz 07h30 às 17h15.
  Qual horário a IA informa?
- **P9 — IMPORTANTE. Áudio.** O cliente pediu resposta em áudio para quem não lê. Confirmar:
  responde em áudio sempre que o lead manda áudio, ou só quando o lead pede?
  E qual voz/tom (o preview tem TTS).
- **P27 — DEPOIS. Persistência da preferência de canal.** Hoje o fluxo não manda
  `PREFERENCIA_CANAL`, então o Verificador só enxerga o pedido no turno em que
  ele acontece; nos turnos seguintes ele se guia pelo formato da mensagem do
  cliente e pela forma do rascunho. Quando o n8n passar esse campo (`audio`,
  `texto` ou vazio, atualizado quando o cliente pedir), a preferência passa a
  valer a conversa inteira, sem heurística.
- **P10 — DEPOIS. Primeiro nome.** A IA vai receber o nome do lead do WhatsApp? Se não vier,
  pergunta o nome na abertura ou só no fechamento?

## Empresa e unidades

- **P3 — IMPORTANTE. Unidade de Petrópolis.** O briefing cita três unidades, mas o site
  telhasbarreiro.com.br só mostra duas. O endereço de Petrópolis (Estrada União e Indústria,
  7521, Nogueira) veio do site diamantetelhas.com.br. A IA pode informar esse endereço?
- **P11 — BLOQUEIA. Relação com a Diamante Telhas.** O briefing lista
  diamantetelhas.com.br como site das unidades do RJ, com CNPJ e telefone próprios
  ((24) 2060-2232 / WhatsApp (24) 99928-2795). A IA se apresenta como Telhas Barreiro
  para todo mundo, ou como Diamante quando o lead é do RJ? Isso muda a identidade,
  o site que ela manda e a ficha que ela envia.
- **P12 — DEPOIS. Campanhas por unidade.** O briefing diz que as unidades podem ter campanhas
  distintas. Hoje existe alguma campanha ativa que a IA deve mencionar
  (o Instagram mostrou um cupom de desconto)? Se existir, a IA pode citar o desconto?

## Produto

- **P4 — BLOQUEIA. Cores e acabamento.** Não há lista de cores em nenhum material.
  A dúvida "quais cores?" está na lista das mais frequentes do próprio cliente.
  Preciso da lista de cores disponíveis (ou autorização para a IA responder
  "o vendedor confirma as cores disponíveis").
- **P5 — IMPORTANTE. Forro amadeirado.** O Instagram promove telha forro com acabamento
  amadeirado e um dos PDFs é o manual de manuseio dele, mas a ficha técnica fala só da
  chapa inferior branca RAL 9003. O amadeirado é linha ativa? Quais padrões?
  Muda comprimento máximo ou preço de referência?
- **P13 — IMPORTANTE. Prazo de fabricação.** Está entre as dúvidas mais frequentes e
  não há prazo documentado. A IA pode dar algum prazo (ex: "X dias úteis após aprovação")
  ou sempre joga para o vendedor?
- **P14 — IMPORTANTE. Frete e cobertura de entrega.** "Entregam na minha cidade?" e
  "o frete é à parte?" estão na lista de dúvidas frequentes. A IA pode afirmar
  "atendemos todo o Brasil, frete calculado pelo vendedor conforme o CEP"?
  Existe região sem entrega ou com cotação manual?
- **P15 — IMPORTANTE. Comprimento máximo da telha simples.** Tenho a tabela de comprimento
  máximo das termoacústicas (7 a 12 m conforme espessura), mas não da telha simples
  galvalume/galvanizada. Qual é o máximo e o mínimo de fabricação dela?
- **P16 — DEPOIS. Material de fixação e espaçamento entre telhas.** Duas dúvidas frequentes
  citadas pelo cliente. A ficha dá: mínimo 4 fixadores por apoio por telha, fixação nas bicas
  baixas com autobrocante, terças a cada 1,5 m, inclinação mínima 10%, largura útil 980 a 1000 mm.
  Confirmar que a IA pode repetir isso — é informação de ficha, não recomendação de engenharia.
- **P17 — DEPOIS. Quantidade mínima de pedido.** Existe pedido mínimo (metragem, valor ou
  quantidade de peças)? Isso muda o critério de qualificação e de descarte.
- **P18 — DEPOIS. Treliça.** Aparece no site da Diamante e não no briefing. É produto
  que a IA pode oferecer?

## Comercial

- **P6 — IMPORTANTE. Pagamento e CNPJ.** O briefing diz "informar Pix/cartão/boleto,
  parcelamento e regras para CNPJ se aplicável". A IA pode afirmar essas formas de pagamento
  por conta própria? Parcela em quantas vezes? Preço para CNPJ é realmente diferente
  (é uma das dúvidas frequentes) e a IA pode dizer isso?
- **P19 — IMPORTANTE. Objeção de preço do concorrente.** O cliente pediu para a IA
  "pedir para abrir o que encontrou de valor para que seja avaliado". Confirmar o texto exato
  dessa abordagem, e se a IA pode prometer que a gerência avalia (o briefing sugere que sim).
- **P20 — DEPOIS. Validade do orçamento.** Existe prazo de validade padrão? O follow-up diz
  que o orçamento "precisará ser atualizado" — em quantos dias ele expira?

## Qualificação e handoff

- **P7 — BLOQUEIA. Lista de vendedores e roteamento.** O briefing descreve a regra
  (por região, e lead recorrente volta para a mesma vendedora) mas não traz nomes, filas,
  números nem a regra de rodízio. Para o handoff funcionar preciso saber:
  quais filas existem, como o n8n identifica a vendedora anterior,
  e o que é "grande obra" em número (a partir de quantos m² ou quantas peças vai para B2B).
- **P21 — BLOQUEIA. Contrato do webhook.** Confirmar com o que o n8n responde e espera:
  campos do payload de entrada (nome, telefone, histórico, formato áudio/texto, anexos) e
  o formato de saída que o parser espera (mesmo padrão `{ "messages": { "1": ... } }` dos
  projetos anteriores?). Também: existe tool de handoff (nome e assinatura) ou o
  encerramento é por marcador no texto?
- **P22 — IMPORTANTE. CEP obrigatório.** O briefing coloca CEP de entrega como campo
  obrigatório. Muito lead de WhatsApp não tem o CEP na mão. A IA aceita cidade/UF como
  substituto e marca o CEP como pendente, ou trava até conseguir o CEP?
- **P23 — IMPORTANTE. Lead que só quer preço e não dá especificação.** Depois de quantas
  tentativas a IA passa para o vendedor mesmo com dado faltando? Proposta: 2 tentativas,
  depois handoff marcando o que falta.
- **P24 — DEPOIS. Pós-venda.** Quem é o responsável por pós-venda/avaria (nome, fila)?
  Hoje só tenho o contato de compras e financeiro (Kely).

## Conteúdo e material

- **P8 — IMPORTANTE. Follow-up.** "1 dia útil" é o prazo. Quantas tentativas no total?
  Em que horário? Pode chamar no sábado?
- **P25 — IMPORTANTE. Arquivos que a IA envia.** As fichas estão públicas no site
  (`/fichatecnica/telha-sanduiche.pdf`, `telha-forro.pdf`, `telha-semisanduiche.pdf`,
  `telhas-galvalume-e-galvanizada.pdf`). A IA manda o link, o arquivo, ou os dois?
  Existe catálogo completo em PDF e o link dele?
- **P26 — DEPOIS. Conversas reais.** O briefing pedia de 5 a 10 conversas de WhatsApp e
  elas não vieram. Sem elas, o tom vai sair calibrado pelo playbook e pelas mensagens
  operacionais que o cliente colou (confirmação de pedido, descarga, retirada) —
  que, por sinal, mostram um tom com emoji e caixa alta de alerta. Vale conseguir as conversas
  antes da versão de produção.
