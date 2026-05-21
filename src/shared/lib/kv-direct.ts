/**
 * Acceso directo a Vercel KV usando @vercel/kv
 * Fallback: almacenamiento en caché de memoria
 */

import { kv } from '@vercel/kv'

const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

// Caché en memoria como fallback
const memoryCache = new Map<string, any>()

export async function getFromKV<T>(key: string, defaultValue: T): Promise<T> {
  try {
    if (USE_KV) {
      const value = await kv.get<T>(key)
      return value ?? defaultValue
    }
    return memoryCache.get(key) ?? defaultValue
  } catch (err) {
    console.error(`[KV] Error reading ${key}:`, err)
    return memoryCache.get(key) ?? defaultValue
  }
}

export async function setToKV<T>(key: string, value: T): Promise<void> {
  try {
    memoryCache.set(key, value)
    if (USE_KV) {
      await kv.set(key, value)
    }
  } catch (err) {
    console.error(`[KV] Error writing ${key}:`, err)
  }
}

export async function appendToList<T>(key: string, item: T): Promise<void> {
  try {
    const list = await getFromKV<T[]>(key, [])
    list.push(item)
    await setToKV(key, list)
  } catch (err) {
    console.error(`[KV] Error appending to ${key}:`, err)
  }
}
