import { useMemo, useState } from 'react'
import './awards.css'

type AwardItem = {
  id: string
  title: string
  subtitle?: string
  player?: { name: string; team: string; abbr: string; color: string }
  stat?: string
  icon: string
  category: 'match' | 'season' | 'tournament'
}

const SAMPLE: AwardItem[] = [
  { id: 'a1', title: 'Raider of the Match', player: { name: 'Bharath Gowda', team: 'SKBC', abbr: 'SK', color: '#0ea5e9' }, stat: '17 raid pts', icon: '⚡', category: 'match' },
  { id: 'a2', title: 'Defender of the Match', player: { name: 'Rohan A', team: 'KBRC', abbr: 'KB', color: '#f59e0b' }, stat: '6 tackle pts', icon: '🛡️', category: 'match' },
  { id: 'a3', title: 'All-Rounder of the Match', player: { name: 'Vikram S', team: 'RG', abbr: 'RG', color: '#ef4444' }, stat: '9 total pts', icon: '🔥', category: 'match' },
  { id: 's1', title: 'Top Raider • Season', player: { name: 'Arjun K', team: 'SKBC', abbr: 'SK', color: '#0ea5e9' }, stat: '182 raid pts', icon: '🏆', category: 'season' },
  { id: 's2', title: 'Top Defender • Season', player: { name: 'Praveen D', team: 'KBRC', abbr: 'KB', color: '#f59e0b' }, stat: '122 tackle pts', icon: '🏆', category: 'season' },
  { id: 't1', title: 'Tournament MVP', player: { name: 'Kiran M', team: 'RG', abbr: 'RG', color: '#ef4444' }, stat: '264 total pts', icon: '🌟', category: 'tournament' },
]

function TeamBadge({ abbr, color, size = 32 }: { abbr: string; color: string; size?: number }) {
  return (
    <div className="aw-team-badge" style={{ width: size, height: size, borderRadius: size * 0.28, background: `linear-gradient(135deg, ${color}, ${color}aa)`, fontSize: size * 0.36, boxShadow: `0 2px 8px ${color}44` }}>{abbr}</div>
  )
}

export default function Awards() {
  const [tab, setTab] = useState<'match' | 'season' | 'tournament'>('match')
  const [season, setSeason] = useState('KPL 2026')
  const [city, setCity] = useState('All')
  const [tournament, setTournament] = useState('All')
  const items = useMemo(() => SAMPLE.filter(i => i.category === tab), [tab])
  return (
    <div className="aw-page">
      <div className="aw-head">
        <div>
          <div className="aw-title">Play Kabaddi Awards</div>
          <div className="aw-sub">Kabaddi honors and highlights</div>
        </div>
        <div className="aw-filters">
          <select className="select" value={season} onChange={e => setSeason(e.target.value)} aria-label="Select Season">
            {['KPL 2026', 'KPL 2025', 'KPL 2024'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select" value={tournament} onChange={e => setTournament(e.target.value)} aria-label="Select Tournament">
            {['All', 'KPL', 'Spring Cup', 'Monsoon League'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select" value={city} onChange={e => setCity(e.target.value)} aria-label="Select City">
            {['All', 'Bengaluru', 'Pune', 'Delhi'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="aw-tabs">
        <button type="button" className={`aw-tab ${tab==='match'?'active':''}`} onClick={() => setTab('match')}>Match Awards</button>
        <button type="button" className={`aw-tab ${tab==='season'?'active':''}`} onClick={() => setTab('season')}>Season Awards</button>
        <button type="button" className={`aw-tab ${tab==='tournament'?'active':''}`} onClick={() => setTab('tournament')}>Tournament Awards</button>
      </div>
      <div className="aw-grid">
        {items.map(a => (
          <div key={a.id} className="aw-card">
            <div className="aw-card-head">
              <div className="aw-icon">{a.icon}</div>
              <div className="aw-card-title">{a.title}</div>
            </div>
            {a.player && (
              <div className="aw-card-body">
                <div className="aw-row">
                  <TeamBadge abbr={a.player.abbr} color={a.player.color} size={40} />
                  <div className="aw-player">
                    <div className="aw-name">{a.player.name}</div>
                    <div className="aw-team">{a.player.team}</div>
                  </div>
                  <div className="aw-stat">{a.stat}</div>
                </div>
              </div>
            )}
            <div className="aw-card-foot">
              <a className="btn btn-outline-sky btn-sm" href="/me/posters">Create Poster</a>
              <a className="btn btn-purple btn-sm" href="/leaderboards">View Stats</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
