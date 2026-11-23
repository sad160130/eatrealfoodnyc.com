type Entry = { expires: number; value: unknown }

export interface SuccessMemoStore {
  values: Map<string, Entry>
  inflight: Map<string, Promise<unknown>>
}

const processStore: SuccessMemoStore = {
  values: new Map(),
  inflight: new Map(),
}

/**
 * Process-local cache of successful loads only. A rejection is not stored, so
 * the next caller tries again. Concurrent callers share one in-flight promise.
 * This is not `unstable_cache`: a numeric `revalidate` there is copied onto
 * the prerender and would pull fully static routes down to that interval.
 */
export function memoizeSuccess<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  options?: { now?: () => number; store?: SuccessMemoStore }
): Promise<T> {
  const store = options?.store ?? processStore
  const now = options?.now ?? Date.now
  const hit = store.values.get(key)
  if (hit && hit.expires > now()) return Promise.resolve(hit.value as T)
  const pending = store.inflight.get(key)
  if (pending) return pending as Promise<T>

  const promise = Promise.resolve()
    .then(load)
    .then((value) => {
      store.values.set(key, { expires: now() + ttlMs, value })
      return value
    })
    .finally(() => {
      if (store.inflight.get(key) === promise) store.inflight.delete(key)
    })
  store.inflight.set(key, promise)
  return promise
}
