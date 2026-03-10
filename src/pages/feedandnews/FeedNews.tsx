import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getItems as feedGetItems, addAnnouncement as feedAddAnnouncement } from '../../shared/state/feedStore'
import { getSettings } from '../../shared/state/settingsStore'
import './feed-news.css'

type FeedType = 'update' | 'announcement' | 'highlight' | 'result'
type FeedItem = {
  id: string
  type: FeedType
  title: string
  sub: string
  date: string
  match?: {
    id: string
    teams: string
    status: 'live' | 'completed' | 'upcoming'
    meta?: string
  }
}

export default function FeedNews() {
  const [tab, setTab] = useState<FeedType | 'all'>('all')
  const initialItems = useMemo<FeedItem[]>(
    () => {
      const base: FeedItem[] = [
        { id: 'r1', type: 'result', title: 'Match Result', sub: 'SKBC defeated Rangers (34–29)', date: '2026-02-10T21:00:00', match: { id: 'm1', teams: 'SKBC vs Rangers', status: 'completed' } },
        { id: 'a1', type: 'announcement', title: 'Tournament Update', sub: 'KPL 2026 Final will be held at Indoor Stadium.', date: '2026-02-20T10:00:00' }
      ]
      const generated = generateFromEvents()
      return [...generated, ...base].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    []
  )
  const [items, setItems] = useState<FeedItem[]>(initialItems)
  React.useEffect(() => {
    const sync = () => setItems(prev => {
      const fromStore = feedGetItems()
      const merged = [...fromStore, ...prev].reduce<FeedItem[]>((acc, it) => {
        if (!acc.some(x => x.id === it.id)) acc.push(it)
        return acc
      }, [])
      return merged.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
    const { newsRefreshMs } = getSettings()
    const id = setInterval(sync, newsRefreshMs)
    sync()
    return () => clearInterval(id)
  }, [])
  const filtered = useMemo(() => items.filter(i => tab === 'all' ? true : i.type === tab), [items, tab])

  const [adding, setAdding] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annSub, setAnnSub] = useState('')
  const canPublish = annTitle.trim().length > 0 && annSub.trim().length > 0
  const publishAnnouncement = () => {
    if (!canPublish) return
    feedAddAnnouncement(annTitle.trim(), annSub.trim())
    setItems(prev => feedGetItems().length ? [...feedGetItems()] : prev)
    setAdding(false); setAnnTitle(''); setAnnSub('')
  }

  function generateFromEvents(): FeedItem[] {
    const matches = [
      {
        id: 'm2',
        teams: 'Warriors vs Titans',
        status: 'live' as const,
        half: 1,
        time: '04:12',
        events: [
          { type:'successful_raid', note:'Rahul scores 2 points', ts: Date.now()-60_000 },
          { type:'super_tackle', note:'Fazel tackles raider for 3 points', ts: Date.now()-40_000 },
        ]
      },
      {
        id: 'm3',
        teams: 'SKBC vs Rangers',
        status: 'live' as const,
        half: 2,
        time: '03:45',
        events: [
          { type:'super_raid', note:'Ajay scored 3 raid points', ts: Date.now()-30_000 },
          { type:'timeout', note:'Team timeout', ts: Date.now()-20_000 },
        ]
      }
    ]
    const out: FeedItem[] = []
    matches.forEach(m => {
      m.events.forEach(ev => {
        const isHighlight = ev.type === 'super_raid' || ev.type === 'super_tackle'
        const t: FeedType = isHighlight ? 'highlight' : 'update'
        out.push({
          id: `${m.id}-${ev.ts}`,
          type: t,
          title: isHighlight ? (ev.type==='super_raid'?'Super Raid!':'Super Tackle!') : 'LIVE UPDATE',
          sub: ev.note || '',
          date: new Date(ev.ts).toISOString(),
          match: { id: m.id, teams: m.teams, status: 'live', meta: `Half ${m.half} • ${m.time}` }
        })
      })
    })
    return out
  }

  return (
    <div className="fn-page">
      <div className="fn-header">
        <h1 className="fn-title">News & Updates</h1>
        <div className="fn-sub">Latest match updates and announcements</div>
      </div>

      <div className="fn-tabs">
        {['all','update','announcement','highlight','result'].map(k => (
          <button key={k} className={`fn-tab ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>
            {k==='all'?'All':k==='update'?'Match Updates':k==='announcement'?'Announcements':k==='highlight'?'Highlights':'Results'}
          </button>
        ))}
      </div>

      <div className="fn-admin">
        {!adding ? (
          <button className="fn-admin-btn" onClick={()=>setAdding(true)}>+ Add Announcement</button>
        ) : (
          <div className="fn-admin-form">
            <input className="fn-input" placeholder="Title" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} />
            <textarea className="fn-textarea" placeholder="Announcement details" value={annSub} onChange={e=>setAnnSub(e.target.value)} />
            <div className="fn-admin-actions">
              <button className="fn-secondary" onClick={()=>{setAdding(false); setAnnTitle(''); setAnnSub('')}}>Cancel</button>
              <button className="fn-primary" disabled={!canPublish} onClick={publishAnnouncement}>Publish</button>
            </div>
          </div>
        )}
      </div>

      <div className="fn-list">
        {filtered.map(i => {
          const link = i.match ? `/matches/${i.match.id}` : undefined
          return (
            <div key={i.id} className={`fn-card fn-${i.type}`}>
              <div className="fn-top">
                <div className="fn-badge">
                  {i.type==='update'?'LIVE UPDATE':i.type==='announcement'?'Announcement':i.type==='highlight'?'Highlight':'Match Result'}
                </div>
                <div className="fn-date">{new Date(i.date).toLocaleDateString()}</div>
              </div>
              <div className="fn-titleline">{i.title}</div>
              <div className="fn-subline">{i.sub}</div>
              {i.match && (
                <div className="fn-match">
                  <div className="fn-matchline">{i.match.teams}</div>
                  {i.match.meta && <div className="fn-meta">{i.match.meta}</div>}
                </div>
              )}
              {link && (
                <Link to={link} className="fn-cta">{i.type==='update'?'Go to Match':'Match Details'}</Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
