// Guarda os áudios que o n8n manda em base64.
//
// Por que IndexedDB e não localStorage: um áudio de 1 minuto em base64 passa
// de 300 KB e a cota do localStorage (~5 MB, e em string) estoura rápido. O
// IndexedDB guarda Blob binário e tem cota bem maior, então a bolha de voz
// sobrevive ao reload da página.

const DB_NAME = "telhasbarreiro-ia"
const DB_VERSION = 1
const STORE = "audios"

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null)
  }
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })

  return dbPromise
}

/** Converte "data:audio/mpeg;base64,..." em Blob. Devolve null se não for data URI. */
export function dataUriToBlob(dataUri: string): Blob | null {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUri)
  if (!match) return null
  const mime = match[1] || "audio/mpeg"
  const isBase64 = Boolean(match[2])
  const payload = match[3]
  try {
    if (!isBase64) {
      return new Blob([decodeURIComponent(payload)], { type: mime })
    }
    const binary = atob(payload)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: mime })
  } catch {
    return null
  }
}

export async function saveAudio(id: string, blob: Blob): Promise<void> {
  const db = await openDb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite")
      tx.objectStore(STORE).put(blob, id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

export async function loadAudio(id: string): Promise<Blob | null> {
  const db = await openDb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly")
      const request = tx.objectStore(STORE).get(id)
      request.onsuccess = () => {
        const value = request.result
        resolve(value instanceof Blob ? value : null)
      }
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function clearAudios(): Promise<void> {
  const db = await openDb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite")
      tx.objectStore(STORE).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}
