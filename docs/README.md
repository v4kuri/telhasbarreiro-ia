# Telhas Barreiro — SDR IA (preview)

Simulador de WhatsApp para validar a **Bruna**, assistente de qualificação e
orçamento da Telhas Barreiro, antes de ligar no número real.

## Documentos

| Arquivo | O que é |
|---|---|
| [01-mapeamento.md](01-mapeamento.md) | Goal, fonte de verdade, cadência, personas, risco, handoff. Base dos prompts |
| [02-perguntas-abertas.md](02-perguntas-abertas.md) | 26 lacunas do briefing, classificadas por bloqueio |
| [03-questionario-cliente.md](03-questionario-cliente.md) | 30 perguntas prontas pra enviar à Telhas Barreiro |
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
### Contrato de resposta (n8n → preview)

Dois campos: `type` diz o que está vindo, `text` carrega o conteúdo.

```json
{ "type": "text", "text": "Oi, sou a Bruna..." }
```

```json
{
  "type": "audio",
  "text": "Oi, sou a Bruna... (vira a transcrição embaixo do áudio)",
  "audio": "https://.../resposta.mp3"
}
```

- **`type: "audio"` precisa dos dois campos.** Sem `audio`, o preview exibe o
  `text` como mensagem normal (nunca fica mudo).
- **Formato do áudio, em ordem de preferência:**
  1. **URL https pública de `.mp3`** (`audio/mpeg`) — mais leve, dá cache e não
     estoura payload. É o formato recomendado.
  2. **Data URI**: `data:audio/mpeg;base64,...`
  3. **Base64 puro** no campo `audio`, com o MIME em `mime` (ex: `audio/mpeg`).
     Sem `mime`, o preview assume `audio/mpeg`.
- **Use mp3.** OGG/Opus não toca no Safari e WAV pesa várias vezes mais.
- Áudio em base64 não é guardado no localStorage (estoura a cota): ao recarregar
  a página, aquela bolha volta como texto. Com URL https, o áudio sobrevive ao
  reload. Mais um motivo pra preferir URL.
- O payload pode vir embrulhado em array, em `output`, `data`, `json`, `body`,
  `result` ou `response`, inclusive como string JSON — o proxy desembrulha.
- Compatibilidade: resposta em texto puro, sem `type`, continua funcionando e é
  tratada como `text`.

### Timeout

Não existe timeout no front nem no proxy: o n8n pode levar o tempo que precisar
pra gerar o áudio. O único limite é o `maxDuration` da função na Vercel
(300 s em `app/api/chat/route.ts`).
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
