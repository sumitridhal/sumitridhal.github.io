const cache = new Map<string, Promise<void>>()

export function preloadImage(src: string): Promise<void> {
  const existing = cache.get(src)
  if (existing) return existing

  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  }).finally(() => {
    /* keep resolved promise in map for dedupe */
  })

  cache.set(src, promise)
  return promise
}

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map((u) => preloadImage(u)))
}

export function clearImagePreloadCache(): void {
  cache.clear()
}
