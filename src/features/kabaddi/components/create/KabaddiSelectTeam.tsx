import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, QrCode } from 'lucide-react'
import './select-team.css'
import { setTeam } from '../../state/createDraft'
import { supabase } from '@shared/lib/supabase'

type Team = { id: string; name: string; location: string; captain: string; avatar?: string }

export default function KabaddiSelectTeam() {
  const { slot } = useParams()
  const navigate = useNavigate()
  const goBack = () => {
    if (slot === 'b') {
      navigate('/kabaddi/create/select-team/a')
    } else {
      navigate('/kabaddi/create')
    }
  }
  const [tab, setTab] = useState<'your' | 'opponents' | 'add'>('your')
  const [q, setQ] = useState('')

  const [yourTeams, setYourTeams] = useState<Team[]>([
    { id: 't1', name: 'SKBC Varadanayakanahalli', location: 'Bengaluru (Bangalore)', captain: 'Govi V G' },
    { id: 't2', name: 'SKBC VN Halli', location: 'Bengaluru (Bangalore)', captain: 'Shankar' },
    { id: 't3', name: 'CSE A', location: 'Bengaluru (Bangalore)', captain: 'Praveen Kumar' },
    { id: 't4', name: 'CSE B', location: 'Bengaluru (Bangalore)', captain: 'Chandan' }
  ])

  const [opponents] = useState<Team[]>([
    { id: 'o1', name: 'Rangers', location: 'Nelmangala', captain: 'Narasimha' },
    { id: 'o2', name: 'Ananthapura Royals', location: 'Nelmangala', captain: 'Chandra' },
    { id: 'o3', name: 'Falcons', location: 'Bengaluru', captain: 'Babu' }
  ])

  useEffect(() => {
    let cancelled = false
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name, short, status')
        if (error || !data || cancelled) return
        const mapped: Team[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          location: '',
          captain: t.status || '—',
        }))
        if (!cancelled && mapped.length > 0) {
          setYourTeams(mapped)
        }
      } catch (e) {
        console.error('Team fetch error:', e)
      }
    }
    fetchTeams()
    return () => {
      cancelled = true
    }
  }, [])

  const list = tab === 'your' ? yourTeams : opponents
  const filtered = list.filter(t => t.name.toLowerCase().includes(q.toLowerCase()))

  const title = tab === 'add' ? 'Create your team' : (slot === 'a' ? 'Select team a' : 'Select team b')

  const handlePick = (id: string) => {
    const picked = list.find(t => t.id === id)
    if (picked) setTeam((slot === 'a' ? 'a' : 'b'), { id: picked.id, name: picked.name })
    navigate('/kabaddi/create')
  }

  const [teamName, setTeamName] = useState('')
  const [city, setCity] = useState('')
  const [captainPhone, setCaptainPhone] = useState('')
  const [captainName, setCaptainName] = useState('')
  const [addSelf, setAddSelf] = useState(false)

  const canSubmit = teamName.trim().length > 0 && city.trim().length > 0

  const onCreateTeam = () => {
    if (!canSubmit) return
    const newTeam: Team = {
      id: `t${Date.now()}`,
      name: teamName.trim(),
      location: city.trim(),
      captain: captainName.trim() || '—'
    }
    setYourTeams(prev => [newTeam, ...prev])
    setTeamName('')
    setCity('')
    setCaptainPhone('')
    setCaptainName('')
    setAddSelf(false)
    setTab('your')
  }

  return (
    <div className="st-page">
      <div className="st-header">
        <button className="st-back" onClick={goBack}>←</button>
        <div className="st-title">{title}</div>
        <div className="st-right">
          <button className="st-icon" aria-label="Scan team QR" title="Scan team QR"><QrCode size={18} /></button>
          <button className="st-icon" aria-label="Search teams" title="Search teams"><Search size={18} /></button>
        </div>
      </div>

      <div className="st-tabs">
        <button className={`st-tab ${tab === 'your' ? 'active' : ''}`} onClick={() => setTab('your')}>Your Teams</button>
        <button className={`st-tab ${tab === 'opponents' ? 'active' : ''}`} onClick={() => setTab('opponents')}>Opponents</button>
        <button className={`st-tab ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>Add</button>
      </div>

      {tab !== 'add' ? (
        <>
          <div className="st-filter">
            <input className="st-input" placeholder="Quick search" value={q} onChange={e => setQ(e.target.value)} />
            <button className="st-add" onClick={() => setTab('add')}>+ Add team</button>
          </div>
          <div className="st-list">
            {filtered.map(t => (
              <div key={t.id} className="st-card" onClick={() => handlePick(t.id)}>
                <div className="st-avatar">{t.name.slice(0,2).toUpperCase()}</div>
                <div className="st-info">
                  <div className="st-name">{t.name}</div>
                  <div className="st-meta">📍 {t.location}  ·  C {t.captain}</div>
                </div>
                <button className="st-qr" aria-label="Show team QR" title="Show team QR"><QrCode size={16} /></button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="st-add-form">
          <div className="st-logo-card">
            <div className="st-logo-circle">Add</div>
            <div className="st-logo-sub">Team logo</div>
          </div>
          <div className="st-form">
            <input className="st-input" placeholder="Team name *" value={teamName} onChange={e => setTeamName(e.target.value)} />
            <input className="st-input" placeholder="City / town *" value={city} onChange={e => setCity(e.target.value)} />
            <input className="st-input" placeholder="+91 Team captain/coordinator number (optional)" value={captainPhone} onChange={e => setCaptainPhone(e.target.value)} />
            <input className="st-input" placeholder="Team captain name (optional)" value={captainName} onChange={e => setCaptainName(e.target.value)} />
            <label className="st-check">
              <input type="checkbox" checked={addSelf} onChange={e => setAddSelf(e.target.checked)} />
              <span>Add myself in team</span>
            </label>
          </div>
          <div className="st-sticky">
            <button className="st-add-submit" disabled={!canSubmit} onClick={onCreateTeam}>Add team</button>
          </div>
        </div>
      )}
    </div>
  )
}
