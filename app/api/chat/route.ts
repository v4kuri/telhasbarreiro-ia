// Proxy do chat TELHAS BARREIRO: encaminha a mensagem ao webhook n8n da Bruna
// e devolve pra UI um envelope normalizado { type, text, audio }.
//
// Contrato de resposta esperado do n8n (qualquer uma destas formas):
//   { "type": "text",  "text": "..." }
//   { "type": "audio", "text": "transcrição", "audio": "https://.../a.mp3" }
//   { "type": "audio", "text": "transcrição", "audio": "data:audio/mpeg;base64,..." }
//   { "type": "audio", "text": "transcrição", "audio": "<base64 puro>", "mime": "audio/mpeg" }
// Também aceita o payload embrulhado em array, em `output`, `data` ou `json`,
// e ainda o formato antigo (texto puro), que vira type "text".
import { NextResponse } from "next/server"

export const maxDuration = 300
export const dynamic = "force-dynamic"

const N8N_WEBHOOK_URL =
  "https://automacao.v4kuri.com.br/webhook/c1354108-2ed5-4b5e-804d-49869e656f72"

type Json = Record<string, unknown>

const TEXT_KEYS = [
  "text",
  "texto",
  "transcricao",
  "transcrição",
  "transcript",
  "message",
  "mensagem",
  "content",
  "reply",
  "answer",
  "body",
] as const

const AUDIO_KEYS = [
  "audio",
  "audioUrl",
  "audio_url",
  "audioBase64",
  "audio_base64",
  "voice",
  "file",
  "fileUrl",
  "url",
  "data",
] as const

const MIME_KEYS = ["mime", "mimeType", "mime_type", "contentType", "content_type"] as const

const isObj = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v)

/** Desembrulha array, `output`, `data`, `json`, e strings que carregam JSON. */
function unwrap(value: unknown, depth = 0): unknown {
  if (depth > 6) return value

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return unwrap(JSON.parse(trimmed), depth + 1)
      } catch {
        return value
      }
    }
    return value
  }

  if (Array.isArray(value)) return unwrap(value[0], depth + 1)

  if (isObj(value)) {
    // Se já tem a forma final, para aqui.
    if ("type" in value || "text" in value || "audio" in value) return value
    for (const key of ["output", "data", "json", "body", "result", "response"]) {
      if (key in value) return unwrap(value[key], depth + 1)
    }
  }

  return value
}

function pickString(obj: Json, keys: readonly string[]): string {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return ""
}

/** Normaliza o campo de áudio em uma URL tocável pelo <audio> do navegador. */
function toAudioSrc(raw: unknown, mime: string): string {
  if (isObj(raw)) {
    const innerMime = pickString(raw, MIME_KEYS) || mime
    const inner = pickString(raw, ["url", "src", "data", "base64", "content"])
    return inner ? toAudioSrc(inner, innerMime) : ""
  }
  if (typeof raw !== "string") return ""
  const value = raw.trim()
  if (!value) return ""
  if (value.startsWith("data:")) return value
  if (/^https?:\/\//i.test(value)) return value
  // base64 cru
  const cleaned = value.replace(/\s+/g, "")
  if (cleaned.length < 64 || !/^[A-Za-z0-9+/=]+$/.test(cleaned)) return ""
  return `data:${mime || "audio/mpeg"};base64,${cleaned}`
}

interface Normalized {
  type: "text" | "audio"
  text: string
  audio: string
}

function normalize(raw: string): Normalized {
  const payload = unwrap(raw)

  if (typeof payload === "string") {
    return { type: "text", text: payload.trim(), audio: "" }
  }

  if (!isObj(payload)) {
    return { type: "text", text: String(payload ?? "").trim(), audio: "" }
  }

  const declared = String(payload.type ?? payload.tipo ?? "").toLowerCase()
  const text = pickString(payload, TEXT_KEYS)
  const mime = pickString(payload, MIME_KEYS)

  let audio = ""
  for (const key of AUDIO_KEYS) {
    if (!(key in payload)) continue
    audio = toAudioSrc(payload[key], mime)
    if (audio) break
  }

  const isAudio = (declared === "audio" || declared === "voice") && Boolean(audio)

  return {
    type: isAudio ? "audio" : "text",
    text,
    audio: isAudio ? audio : "",
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const content: string | undefined = body?.message ?? body?.content
    const type: string = body?.type === "audio" ? "audio" : "text"
    const sessionId: string = body?.sessionId || crypto.randomUUID()

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 })
    }

    const url = new URL(N8N_WEBHOOK_URL)
    url.searchParams.set("content", content)
    url.searchParams.set("type", type)
    url.searchParams.set("sessionId", sessionId)

    // Sem timeout próprio: o n8n pode levar o tempo que precisar pra gerar o
    // áudio. O único limite é o `maxDuration` da plataforma.
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    const raw = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Webhook n8n retornou erro",
          upstream_status: response.status,
          upstream_body: raw.slice(0, 2000),
          debug: { method: "GET", target: url.toString() },
        },
        { status: 502 }
      )
    }

    const normalized = normalize(raw)

    return NextResponse.json({
      // `output` fica por compatibilidade com o front antigo
      output: normalized.text,
      type: normalized.type,
      text: normalized.text,
      audio: normalized.audio,
      upstream_status: response.status,
      upstream_length: raw.length,
      raw_debug:
        raw.length <= 4000 ? raw : `${raw.slice(0, 4000)}...(${raw.length - 4000} chars a mais)`,
      _version: "route.chat.v7-audio",
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: "Erro ao comunicar com o chatbot", detail },
      { status: 500 }
    )
  }
}
