import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKabaddiStore } from '../../stores/useKabaddiStore'
import { Search, X, Loader2, MonitorPlay, Users, MapPin } from 'lucide-react'
import './GlobalSearch.css'

export default function GlobalSearch() {
  const navigate = useNavigate()
  const { isSearchOpen, setSearchOpen, searchEntities } = useKabaddiStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setResults([])
    }
    return () => { document.body.style.overflow = '' }
  }, [isSearchOpen])

  useEffect(() => {
    // Keyboard shortcut (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!isSearchOpen)
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, setSearchOpen])

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      const data = await searchEntities(query)
      setResults(data)
      setLoading(false)
    }

    const debounceId = setTimeout(() => handleSearch(), 300)
    return () => clearTimeout(debounceId)
  }, [query, searchEntities])

  if (!isSearchOpen) return null

  const handleSelect = (slug: string) => {
    setSearchOpen(false)
    navigate(slug)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSearchOpen(false)
  }

  return (
    <div className="gs-overlay" onClick={handleOverlayClick}>
      <div className="gs-modal">
        <div className="gs-header">
          <Search className="gs-icon" size={24} />
          <input 
            ref={inputRef}
            className="gs-input"
            placeholder="Search teams, players, tournaments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="gs-close" onClick={() => setSearchOpen(false)}>
             <X size={20} />
             <div className="gs-esc-badge">ESC</div>
          </button>
        </div>

        <div className="gs-results">
          {loading && (
             <div className="gs-empty">
                 <Loader2 className="animate-spin" size={24} color="var(--color-primary)" />
             </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="gs-empty">
                No results found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="gs-list">
              {results.map((r, idx) => (
                <div key={`${r.type}-${r.id}-${idx}`} className="gs-item" onClick={() => handleSelect(r.slug)}>
                   <div className="gs-item-icon">
                       {r.image ? (
                           <img src={r.image} alt={r.name} />
                       ) : r.type === 'team' ? (
                           <Users size={24} color="#64748b" />
                       ) : r.type === 'player' ? (
                           <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-navy)' }}>{r.name.charAt(0)}</span>
                       ) : (
                           <MonitorPlay size={24} color="#f59e0b" />
                       )}
                   </div>
                   <div className="gs-item-info">
                       <div className="gs-item-name">{r.name}</div>
                       <div className="gs-item-sub">
                          {r.type === 'tournament' ? <MapPin size={12} style={{ display: 'inline' }} /> : ''} {r.subtitle}
                       </div>
                   </div>
                   <div className="gs-item-type">{r.type}</div>
                </div>
              ))}
            </div>
          )}

          {!loading && query.length < 2 && (
             <div className="gs-empty" style={{ opacity: 0.5 }}>
                Start typing to search globally...
             </div>
          )}
        </div>
        
        <div className="gs-footer">
           <span>Pro-Tip: Press <kbd>Cmd</kbd> + <kbd>K</kbd> to quickly open this anywhere.</span>
        </div>
      </div>
    </div>
  )
}
