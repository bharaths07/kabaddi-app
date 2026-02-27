import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './add-schedule.css'
import { assignScorer as svcAssignScorer } from '../../shared/services/fixturesService'

type Team = { id: string; name: string }
type Status = 'unscheduled' | 'scheduled' | 'scorer_assigned' | 'live' | 'completed'
type Fixture = {
  id: string
  round: number
  home: Team
  guest: Team
  ts?: number
  court?: number
  scorer?: { id: string; name: string; phone: string; confirmed?: boolean }
  status: Status
}

type Tab = 'auto' | 'manual'

type ScorerUser = { id: string; name: string; phone: string }

export default function AddSchedule() {
  const { id } = useParams()
  const navigate = useNavigate()

  const tournament = useMemo(() => {
    const all = [
      { id: 'kpl2026', name: 'KPL 2026', start: '2026-03-05', end: '2026-03-10', teams: 8 },
      { id: 'skbc2026', name: 'Spring Kabaddi Cup', start: '2026-03-01', end: '2026-03-05', teams: 8 },
      { id: 'monsoon2026', name: 'Monsoon League', start: '2026-02-01', end: '2026-02-28', teams: 12 }
    ]
    return all.find(t => t.id === id) || all[0]
  }, [id])

  const baseTeams = useMemo<Team[]>(() => {
    const names = ['Team Pune', 'Team Mumbai', 'Team Delhi', 'Team Chennai', 'Team Kolkata', 'Team Jaipur', 'Team Bengaluru', 'Team Hyderabad', 'Team Lucknow', 'Team Indore', 'Team Patna', 'Team Surat']
    return names.slice(0, tournament.teams).map((n, i) => ({ id: `t${i + 1}`, name: n }))
  }, [tournament.teams])

  const initialFixtures = useMemo<Fixture[]>(() => {
    const pairs: Array<[Team, Team]> = []
    for (let i = 0; i < baseTeams.length; i += 2) {
      if (i + 1 < baseTeams.length) pairs.push([baseTeams[i], baseTeams[i + 1]])
    }
    return pairs.map((p, idx) => ({
      id: `f${idx + 1}`,
      round: 1,
      home: p[0],
      guest: p[1],
      status: 'unscheduled'
    }))
  }, [baseTeams])

  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures)
  const [tab, setTab] = useState<Tab>('auto')

  const [startDate, setStartDate] = useState<string>(tournament.start)
  const [endDate, setEndDate] = useState<string>(tournament.end)
  const [matchesPerDay, setMatchesPerDay] = useState<number>(4)
  const [matchMinutes, setMatchMinutes] = useState<number>(45)
  const [breakMinutes, setBreakMinutes] = useState<number>(15)
  const [courts, setCourts] = useState<number>(2)

  const [filterRound, setFilterRound] = useState<number | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterDate, setFilterDate] = useState<string>('')

  const suggestedScorers = useMemo<ScorerUser[]>(
    () => [
      { id: 's1', name: 'Rahul Sharma', phone: '+91-9876-001234' },
      { id: 's2', name: 'Vikram Patil', phone: '+91-9823-009876' },
      { id: 's3', name: 'Neha Verma', phone: '+91-9811-778899' }
    ],
    []
  )
  const [scorerSearch, setScorerSearch] = useState<string>('')
  const filteredScorers = useMemo(() => {
    const x = scorerSearch.trim().toLowerCase()
    if (!x) return suggestedScorers
    return suggestedScorers.filter(u => u.name.toLowerCase().includes(x) || u.phone.toLowerCase().includes(x))
  }, [suggestedScorers, scorerSearch])
  const [assignForFixtureId, setAssignForFixtureId] = useState<string | null>(null)

  const onGenerate = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const spanDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1)
    const perDayCapacity = matchesPerDay * courts
    const slotMinutes = matchMinutes + breakMinutes
    const dayStartHour = 9
    const updated: Fixture[] = []
    let fi = 0
    for (let d = 0; d < spanDays; d++) {
      const dayBase = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d, dayStartHour, 0, 0).getTime()
      for (let s = 0; s < perDayCapacity && fi < fixtures.length; s++) {
        const courtNum = (s % courts) + 1
        const timeOffset = Math.floor(s / courts) * slotMinutes
        const ts = dayBase + timeOffset * 60 * 1000
        const f = fixtures[fi]
        updated.push({ ...f, ts, court: courtNum, status: 'scheduled' })
        fi++
      }
    }
    setFixtures(prev => updated.concat(prev.slice(updated.length)))
  }

  const onEditFixture = (fid: string, patch: Partial<Fixture>) => {
    setFixtures(prev => prev.map(f => (f.id === fid ? { ...f, ...patch, status: patch.scorer ? 'scorer_assigned' : patch.ts || patch.court ? 'scheduled' : f.status } : f)))
  }

  const visibleFixtures = useMemo(() => {
    return fixtures.filter(f => {
      const roundOk = filterRound === 'all' ? true : f.round === filterRound
      const statusOk = filterStatus === 'all' ? true : f.status === filterStatus
      const dateOk = filterDate
        ? f.ts
          ? new Date(f.ts).toISOString().slice(0, 10) === filterDate
          : false
        : true
      return roundOk && statusOk && dateOk
    })
  }, [fixtures, filterRound, filterStatus, filterDate])

  const openAssign = (fid: string) => setAssignForFixtureId(fid)
  const closeAssign = () => setAssignForFixtureId(null)
  const assignScorer = async (user: ScorerUser) => {
    if (!assignForFixtureId) return
    await svcAssignScorer(assignForFixtureId, user.id)
    onEditFixture(assignForFixtureId, { scorer: { ...user, confirmed: false }, status: 'scorer_assigned' })
    closeAssign()
  }

  return (
    <div className="as-page">
      <div className="as-head">
        <div>
          <div className="as-title">Add Schedule</div>
          <div className="as-sub">Tournament: {tournament.name}</div>
        </div>
      </div>

      <div className="as-tabs">
        {(['auto', 'manual'] as Tab[]).map(k => (
          <button key={k} className={`as-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {k === 'auto' ? 'Auto Generate' : 'Manual'}
          </button>
        ))}
      </div>

      {tab === 'auto' && (
        <div className="as-section">
          <div className="as-form-grid">
            <div className="as-field">
              <label className="as-label">Start date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="as-input" />
            </div>
            <div className="as-field">
              <label className="as-label">End date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="as-input" />
            </div>
            <div className="as-field">
              <label className="as-label">Matches per day</label>
              <input type="number" value={matchesPerDay} onChange={e => setMatchesPerDay(parseInt(e.target.value || '1', 10))} className="as-input" />
            </div>
            <div className="as-field">
              <label className="as-label">Match duration (min)</label>
              <input type="number" value={matchMinutes} onChange={e => setMatchMinutes(parseInt(e.target.value || '45', 10))} className="as-input" />
            </div>
            <div className="as-field">
              <label className="as-label">Break time (min)</label>
              <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(parseInt(e.target.value || '15', 10))} className="as-input" />
            </div>
            <div className="as-field">
              <label className="as-label">Courts available</label>
              <input type="number" value={courts} onChange={e => setCourts(parseInt(e.target.value || '1', 10))} className="as-input" />
            </div>
          </div>
          <div className="as-actions">
            <button className="as-primary" onClick={onGenerate}>Generate Schedule</button>
          </div>
        </div>
      )}

      {tab === 'manual' && (
        <div className="as-section">
          <div className="as-note">You can assign dates, times, courts, and scorers per fixture. Partial drafts are allowed.</div>
        </div>
      )}

      <div className="as-section">
        <div className="as-section-head">
          <div className="as-section-title">Fixture List</div>
          <div className="as-filters">
            <select value={filterRound} onChange={e => setFilterRound((e.target.value as any) === 'all' ? 'all' : parseInt(e.target.value, 10))} className="as-select">
              <option value="all">All Rounds</option>
              {[1, 2, 3].map(r => <option key={r} value={r}>Round {r}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="as-select">
              <option value="all">All Status</option>
              <option value="unscheduled">Unscheduled</option>
              <option value="scheduled">Scheduled</option>
              <option value="scorer_assigned">Scorer Assigned</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="as-input" />
          </div>
        </div>

        <div className="as-fixture-list">
          {visibleFixtures.map(f => (
            <div key={f.id} className="as-fixture-card" onClick={() => {}}>
              <div className="as-fixture-top">
                <div className="as-versus">{f.home.name} <span className="as-vs">vs</span> {f.guest.name}</div>
                <span className={`as-badge s-${f.status}`}>{f.status.replace('_', ' ')}</span>
              </div>
              <div className="as-fixture-meta">
                <div className="as-meta-row">
                  <div className="as-meta-item">📅 {f.ts ? new Date(f.ts).toLocaleDateString() : '—'}</div>
                  <div className="as-meta-item">⏰ {f.ts ? new Date(f.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                  <div className="as-meta-item">🏟 Court {f.court || '—'}</div>
                </div>
                <div className="as-meta-row">
                  <div className="as-meta-item">👤 Scorer: {f.scorer ? f.scorer.name : 'Not Assigned'}</div>
                  {f.scorer?.confirmed && <div className="as-confirmed">✅ Confirmed</div>}
                </div>
              </div>
              <div className="as-fixture-actions">
                <input
                  type="date"
                  value={f.ts ? new Date(f.ts).toISOString().slice(0, 10) : ''}
                  onChange={e => {
                    const dateStr = e.target.value
                    const prev = f.ts ? new Date(f.ts) : new Date()
                    const [y, m, d] = dateStr.split('-').map(n => parseInt(n, 10))
                    const ts = new Date(y, m - 1, d, prev.getHours(), prev.getMinutes(), 0).getTime()
                    onEditFixture(f.id, { ts })
                  }}
                  className="as-input small"
                />
                <input
                  type="time"
                  value={f.ts ? new Date(f.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                  onChange={e => {
                    const timeStr = e.target.value
                    const [hh, mm] = timeStr.split(':').map(n => parseInt(n, 10))
                    const base = f.ts ? new Date(f.ts) : new Date()
                    const ts = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0).getTime()
                    onEditFixture(f.id, { ts })
                  }}
                  className="as-input small"
                />
                <select
                  value={f.court || 0}
                  onChange={e => onEditFixture(f.id, { court: parseInt(e.target.value || '1', 10) })}
                  className="as-select small"
                >
                  <option value={0}>Court</option>
                  {[1, 2, 3, 4].map(c => <option key={c} value={c}>Court {c}</option>)}
                </select>
                <button className="as-secondary" onClick={() => openAssign(f.id)}>Assign Scorer</button>
              </div>
            </div>
          ))}
          {visibleFixtures.length === 0 && <div className="as-empty">No fixtures match the filters</div>}
        </div>
      </div>

      <div className="as-foot">
        <button className="as-outline" onClick={() => navigate(`/tournament/${tournament.id}/add-rounds`)}>Back to Rounds</button>
        <button className="as-primary" onClick={() => navigate(`/tournament/${tournament.id}/dashboard`)}>Save & Continue</button>
      </div>

      {assignForFixtureId && (
        <div className="as-sheet">
          <div className="as-sheet-head">
            <div className="as-sheet-title">Assign Scorer</div>
            <button className="as-mini" onClick={closeAssign}>✕</button>
          </div>
          <div className="as-sheet-sub">
            {(() => {
              const f = fixtures.find(x => x.id === assignForFixtureId)!
              return `${f.home.name} vs ${f.guest.name}`
            })()}
          </div>
          <div className="as-sheet-search">
            <input
              value={scorerSearch}
              onChange={e => setScorerSearch(e.target.value)}
              placeholder="Search by name or phone"
              className="as-input"
            />
          </div>
          <div className="as-sheet-list">
            {filteredScorers.map(u => (
              <div key={u.id} className="as-sheet-item">
                <div className="as-sheet-user">
                  <div className="as-user-name">{u.name}</div>
                  <div className="as-user-phone">{u.phone}</div>
                </div>
                <button className="as-primary" onClick={() => assignScorer(u)}>Assign</button>
              </div>
            ))}
            <button className="as-secondary">+ Invite New Scorer</button>
          </div>
        </div>
      )}
    </div>
  )
}
