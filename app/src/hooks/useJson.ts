import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL || '/'

export function useJson<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = path.startsWith('/') ? `${BASE}${path.slice(1)}` : path
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [path])

  return { data, loading }
}
