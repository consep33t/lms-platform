import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Layers, X, ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface SearchResultItem {
  id: number
  type: string
  title: string
  description: string | null
  url: string
  badge: string | null
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      return
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`)
        setResults(res.data.results)
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const handleSelect = (url: string) => {
    onClose()
    navigate(url)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div
        className="max-w-2xl w-full bg-card rounded-2xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari materi, modul, arsitektur jaringan, routing..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-muted rounded border text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
              Mencari konten pembelajaran...
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Tidak ada hasil yang cocok untuk "<strong>{query}</strong>".
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item.url)}
                className="p-3 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-3 group text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === 'module' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {item.type === 'module' ? <BookOpen className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {item.badge}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 px-4 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Pencarian Cepat LMS</p>
              <p>Ketik judul modul atau topik sesi materi untuk melompat langsung ke konten.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
