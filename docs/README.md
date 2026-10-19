# Telhas Barreiro — SDR IA (preview)

Simulador de WhatsApp para validar a **Bruna**, assistente de qualificação e
orçamento da Telhas Barreiro, antes de ligar no número real.

## Documentos

| Arquivo | O que é |
|---|---|
| [01-mapeamento.md](01-mapeamento.md) | Goal, fonte de verdade, cadência, personas, risco, handoff. Base dos prompts |
| [02-perguntas-abertas.md](02-perguntas-abertas.md) | 26 lacunas do briefing, classificadas por bloqueio |
| [prompt-bruna-v1-conversacional.md](prompt-bruna-v1-conversacional.md) | Agente que conversa. Sem tool. Gera rascunho |
| [prompt-bruna-v1-verificador.md](prompt-bruna-v1-verificador.md) | Gatekeeper. Valida, trava, decide encaminhamento, emite o JSON |
| [testes-bruna.md](testes-bruna.md) | Suíte de teste: revisão estática + 6 personas + red-team + stress |

## Arquitetura

```
Cliente ─▶ [Bruna / conversacional] ──rascunho──▶ [Verificador] ─▶ Cliente
            temp 0.5, sem tools                   temp 0.3, json_object
```

Playbooks de referência: [PLAYBOOK-PROMPT-SDR-IA.md](../../PLAYBOOK-PROMPT-SDR-IA.md)
e [PLAYBOOK-TESTE-PROMPT-SDR-IA.md](../../PLAYBOOK-TESTE-PROMPT-SDR-IA.md) (v1 como base).

## Rodar local

```bash
pnpm install
pnpm dev
```

Sobe em `http://localhost:3102`.

## Integração

- Webhook n8n (GET, query `content`, `type`, `sessionId`):
  `https://automacao.v4kuri.com.br/webhook/c1354108-2ed5-4b5e-804d-49869e656f72`
- A resposta pode vir como texto puro ou JSON (`output`, `message`, `content`,
  `text`, `reply`, `answer`). O proxy em `app/api/chat/route.ts` desembrulha.
- Marcadores suportados pela interface: `#SPLIT#`, `#LINK:`, `#BOTOES:`, `#DOC:`,
  `#CARD:`, `#FOTO:`, `#LOCAL:`, `#CONTATO:`, `#ENQUETE:`.
  URLs são validadas contra a allowlist em `lib/parse-markers.ts`
  (telhasbarreiro.com.br, diamantetelhas.com.br, Instagram, g.page, WhatsApp, Maps).
- TTS opcional: mensagens de texto acima de 180 caracteres viram áudio quando
  `OPENAI_API_KEY` está configurada.

## Pendências antes de produção

- Responder as perguntas P4 (cores), P6 (pagamento), P7 (vendedores e roteamento)
  e as demais de [02-perguntas-abertas.md](02-perguntas-abertas.md).
- Rodar as etapas 2 a 4 da suíte de teste e preencher a matriz de cobertura.
- Em produção, trocar o encaminhamento conversacional por tool de handoff,
  exclusiva do Verificador.
