import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './notifications.css'

type NotiType = 'match' | 'tournament' | 'poster' | 'system'
type NotiItem = {
  id: string
  type: NotiType
  title: string
  body: string
  at: number
  unread: boolean
  href?: string
}

function load(): NotiItem[] {
  try {
    const raw = localStorage.getItem('gl.notifications')
    if (raw) return JSON.parse(raw)
  } catch {}
  const now = Date.now()
  return [
    { id: 'n1', type: 'match',      title: 'Match starting soon', body: 'SKBC vs Rangers at 7:00 PM', at: now - 1000 * 60 * 30, unread: true,  href: '/matches' },
    { id: 'n2', type: 'poster',     title: 'Poster saved',        body: 'Man of the Match poster saved', at: now - 1000 * 60 * 90, unread: true,  href: '/me/posters' },
    { id: 'n3', type: 'tournament', title: 'New tournament',      body: 'Spring Kabaddi Cup announced', at: now - 1000 * 60 * 180, unread: false, href: '/tournaments' },
    { id: 'n4', type: 'system',     title: 'Update available',    body: 'Get the latest app features',   at: now - 1000 * 60 * 60 * 26, unread: false, href: '/upgrade' },
  ]
}

function save(items: NotiItem[]) {
  try { localStorage.setItem('gl.notifications', JSON.stringify(items)) } catch {}
}

function agoLabel(ms: number) {
  const d = Math.floor((Date.now() - ms) / 1000)
  if (d < 60) return `${d}s`
  if (d < 3600) return `${Math.floor(d/60)}m`
  if (d < 86400) return `${Math.floor(d/3600)}h`
  return `${Math.floor(d/86400)}d`
}

export default function Notifications() {
  const [tab, setTab] = useState<'all' | NotiType>('all')
  const [items, setItems] = useState<NotiItem[]>(() => load())
  useEffect(() => { save(items) }, [items])
  const filtered = useMemo(() => items.filter(i => tab === 'all' ? true : i.type === tab), [items, tab])
  const today = filtered.filter(i => Date.now() - i.at < 86400000)
  const earlier = filtered.filter(i => Date.now() - i.at >= 86400000)

  const markAllRead = () => setItems(prev => prev.map(i => ({ ...i, unread: false })))
  const clearAll = () => setItems([])
  const toggleRead = (id: string) => setItems(prev => prev.map(i => i.id === id ? ({ ...i, unread: !i.unread }) : i))
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const Tab = ({ k, label }: { k: 'all' | NotiType; label: string }) => (
    <button className={`nt-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{label}</button>
  )

  const Row = ({ n }: { n: NotiItem }) => (
    <div className={`nt-row ${n.unread ? 'unread' : ''}`}>
      <div className={`nt-dot ${n.unread ? 'on' : ''}`} />
      <div className={`nt-badge t-${n.type}`}>{n.type}</div>
      <div className="nt-main">
        <div className="nt-title">{n.title}</div>
        <div className="nt-body">{n.body}</div>
      </div>
      <div className="nt-meta">{agoLabel(n.at)}</div>
      <div className="nt-actions">
        {n.href && <Link to={n.href} className="btn btn-outline-sky btn-sm">Open</Link>}
        <button className="btn btn-ghost btn-sm" onClick={() => toggleRead(n.id)}>{n.unread ? 'Mark read' : 'Mark unread'}</button>
        <button className="btn btn-danger btn-sm" onClick={() => remove(n.id)}>Delete</button>
      </div>
    </div>
  )

  return (
    <div className="nt-page">
      <div className="nt-head">
        <div className="nt-title">Notifications</div>
        <div className="nt-actions-head">
          <button className="btn btn-outline-sky btn-sm" onClick={markAllRead}>Mark all read</button>
          <button className="btn btn-danger btn-sm" onClick={clearAll}>Clear all</button>
        </div>
      </div>
      <div className="nt-tabs">
        <Tab k="all" label="All" />
        <Tab k="match" label="Matches" />
        <Tab k="tournament" label="Tournaments" />
        <Tab k="poster" label="Posters" />
        <Tab k="system" label="System" />
      </div>
      {today.length > 0 && (
        <div className="nt-section">
          <div className="nt-section-title">Today</div>
          <div className="nt-list">
            {today.map(n => <Row key={n.id} n={n} />)}
          </div>
        </div>
      )}
      {earlier.length > 0 && (
        <div className="nt-section">
          <div className="nt-section-title">Earlier</div>
          <div className="nt-list">
            {earlier.map(n => <Row key={n.id} n={n} />)}
          </div>
        </div>
      )}
      {today.length === 0 && earlier.length === 0 && (
        <div className="nt-empty">
          <div className="nt-empty-title">No notifications</div>
          <div className="nt-empty-sub">You’re all caught up</div>
        </div>
      )}
    </div>
  )
}
