import React, { useMemo, useState } from 'react'
import './my-stats.css'
import { getItems as feedGetItems } from '../shared/state/feedStore'
import { getSettings } from '../shared/state/settingsStore'
import { getPlan } from '../shared/state/planStore'
import { Link } from 'react-router-dom'

export default function MyStats() {
  const feed = useMemo(() => feedGetItems(), [])
  const settings = useMemo(() => getSettings(), [])
  const plan = useMemo(() => getPlan(), [])

  const announcements = feed.filter(f => f.type === 'announcement').length
  const highlights = feed.filter(f => f.type === 'highlight').length
  const updates = feed.filter(f => f.type === 'update').length

  const recent = feed.slice(0, 8)
  const [tab, setTab] = useState<'overview'|'matches'|'achievements'>('overview')
  const views = 40
  const [bio, setBio] = useState<string>(() => {
    try { return localStorage.getItem('gl.profile.bio') || 'Kabaddi player • SKBC' } catch { return 'Kabaddi player • SKBC' }
  })
  const profile = { name: 'Bharath Gowda', location: 'Bengaluru (Karnataka)', role: 'Captain • SKBC' }
  const [photo, setPhoto] = useState<string>(() => {
    try { return localStorage.getItem('gl.profile.photo') || '' } catch { return '' }
  })
  const [editOpen, setEditOpen] = useState(false)
  const initials = useMemo(() => profile.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(), [profile.name])
  const matches = [
    {
      id:'mA', stage:'Final', tournament:'KPL 2026', result:'Result', date:'2026-02-13T18:00:00', venue:'Indoor Stadium',
      home:'SKBC', guest:'Rangers', homeScore:54, guestScore:52, overs:'', summary:'SKBC won by 2 points'
    },
    {
      id:'mB', stage:'Qualifier 1', tournament:'KPL 2026', result:'Result', date:'2026-02-11T18:00:00', venue:'City Arena',
      home:'Golden Bulls', guest:'SKBC', homeScore:34, guestScore:35, overs:'', summary:'SKBC won by 1 point'
    },
    {
      id:'mC', stage:'League', tournament:'KPL 2026', result:'Result', date:'2026-02-09T18:00:00', venue:'Open Ground',
      home:'Bajarangi', guest:'SKBC', homeScore:29, guestScore:34, overs:'', summary:'SKBC won by 5 points'
    }
  ]
  const career = [
    { label:'Matches', value: 42 },
    { label:'Wins', value: 28 },
    { label:'Raid Pts', value: 312 },
    { label:'Tackle Pts', value: 146 },
    { label:'Avg Raid', value: 7.4 },
    { label:'Avg Tackle', value: 3.6 },
  ]
  const achievements = [
    { id:'trophy', name:'Tournament Trophy', earned:true },
    { id:'super_raid', name:'Super Raider', earned:true },
    { id:'iron_def', name:'Iron Defender', earned:false },
    { id:'golden_raid', name:'Golden Raider', earned:false },
  ]

  return (
    <div className="ms-page">
      <div className="ms-hero">
        <div className="ms-avatar">
          {photo
            ? <img className="ms-avatar-img" src={photo} alt={profile.name} />
            : <span>{initials}</span>}
        </div>
        <div className="ms-pinfo">
          <div className="ms-pname">{profile.name}</div>
          <div className="ms-pmeta">{profile.location} • {views} views</div>
          <div className="ms-prole">{profile.role}</div>
          <div className="ms-bio-line">{bio}</div>
        </div>
        <div className="ms-actions">
          <Link to="/leaderboards" className="ms-primary">Top players</Link>
          <Link to="/leaderboards" className="ms-secondary">Insights</Link>
        </div>
      </div>

      <div className="ms-strip">
        <div className="ms-chip">Followers 120</div>
        <div className="ms-chip">Profile Views {views}</div>
        <div className="ms-chip">Team Rank #3</div>
        <button className="ms-edit" onClick={() => setEditOpen(v => !v)}>{editOpen ? 'Close' : 'Edit'}</button>
      </div>

      {editOpen && (
        <div className="ms-editor">
          <div className="ms-field">
            <label className="ms-label">Profile Photo</label>
            <input className="ms-input" type="file" accept="image/*" onChange={async e => {
              const f = e.target.files?.[0]
              if (!f) return
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = String(reader.result || '')
                setPhoto(dataUrl)
                try { localStorage.setItem('gl.profile.photo', dataUrl) } catch {}
              }
              reader.readAsDataURL(f)
            }} />
          </div>
          <div className="ms-field">
            <label className="ms-label">Bio</label>
            <textarea className="ms-textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} />
          </div>
          <div className="ms-editor-actions">
            <button className="ms-primary" onClick={() => {
              try { localStorage.setItem('gl.profile.bio', bio) } catch {}
              setEditOpen(false)
            }}>Save</button>
            <button className="ms-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="ms-tabs">
        {['overview','matches','achievements'].map(k=>(
          <button key={k} className={`ms-tab ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
        ))}
      </div>

      {tab==='matches' && (
        <div className="ms-listcards">
          {matches.map(m => (
            <div key={m.id} className="ms-mcard">
              <div className="ms-mtop">
                <div className="ms-mmeta">{m.stage}, {m.tournament}</div>
                <span className="ms-mbadge">{m.homeScore > m.guestScore ? 'W' : 'L'}</span>
              </div>
              <div className="ms-msub">{new Date(m.date).toLocaleDateString()} • {m.venue}</div>
              <div className="ms-scores">
                <div className="ms-side">
                  <div className="ms-sname">{m.home}</div>
                  <div className="ms-sval">{m.homeScore}</div>
                </div>
                <div className="ms-sep">-</div>
                <div className="ms-side right">
                  <div className="ms-sname">{m.guest}</div>
                  <div className="ms-sval">{m.guestScore}</div>
                </div>
              </div>
              <div className="ms-resultline">{m.summary}</div>
              <div className="ms-links">
                <Link to={`/matches/${m.id}/summary`} className="ms-linkbtn">Insights</Link>
                <Link to="/leaderboards" className="ms-linkbtn">Table</Link>
                <Link to="/leaderboards" className="ms-linkbtn">Leaderboard</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='overview' && (
        <div className="ms-cards">
          {career.map(c => (
            <div key={c.label} className="ms-card"><div className="ms-label">{c.label}</div><div className="ms-value">{c.value}</div></div>
          ))}
          <div className="ms-card"><div className="ms-label">Plan</div><div className="ms-value">{plan.toUpperCase()}</div></div>
          <div className="ms-card"><div className="ms-label">Theme</div><div className="ms-value">{settings.theme === 'light' ? 'Light' : 'Dark'}</div></div>
          <div className="ms-card"><div className="ms-label">Announcements</div><div className="ms-value">{announcements}</div></div>
          <div className="ms-card"><div className="ms-label">Highlights</div><div className="ms-value">{highlights}</div></div>
          <div className="ms-card"><div className="ms-label">Match Updates</div><div className="ms-value">{updates}</div></div>
        </div>
      )}

      {tab==='achievements' && (
        <div style={{ marginTop: 8 }}>
          <div className="ms-badges">
            {achievements.map(b => (
              <div key={b.id} className={`ms-badge ${b.earned?'earned':'locked'}`}>
                <div className="ms-badge-icon">{b.earned ? '🏅' : '🔒'}</div>
                <div className="ms-badge-name">{b.name}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
            <Link to="/me/posters" className="ms-primary">My Posters</Link>
          </div>
        </div>
      )}

      
    </div>
  )
}
