import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL || '/'

export function useJson<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(null)
    setLoading(true)
    if (!path) { setLoading(false); return }
    const url = path.startsWith('/') ? `${BASE}${path.slice(1)}` : path
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [path])

  return { data, loading }
}
