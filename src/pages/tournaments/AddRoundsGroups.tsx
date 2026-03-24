import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './add-rounds.css'
import { getTournament, getTournamentTeams, saveTournamentFixtures } from '../../shared/services/tournamentService'
import { Tournament, TournamentTeam } from '../../features/kabaddi/types/kabaddi.types'

type StructureType = 'league' | 'knockout' | 'hybrid'
type DrawType = 'manual' | 'random' | 'seeded'
type MatchFormat = 'bo1' | 'bo3'

type Group = { id: string; name: string; teamIds: string[] }
type Team = { id: string; name: string }

export default function AddRoundsGroups() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [baseTeams, setBaseTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    (async () => {
      setLoading(true)
      const t = await getTournament(id)
      if (t) {
        setTournament(t)
        const teamsData = await getTournamentTeams(t.id)
        setBaseTeams(teamsData.map(dt => ({ id: dt.id.toString(), name: dt.name })))
      }
      setLoading(false)
    })()
  }, [id])

  const [type, setType] = useState<StructureType>('league')

  const defaultRounds = useMemo(() => Math.max(1, baseTeams.length - 1), [baseTeams.length])
  const [rounds, setRounds] = useState<number>(defaultRounds)
  const [pWin, setPWin] = useState<number>(2)
  const [pDraw, setPDraw] = useState<number>(1)
  const [pLoss, setPLoss] = useState<number>(0)
  const [tiebreaker, setTiebreaker] = useState<'diff' | 'h2h' | 'coin'>('diff')

  const [drawType, setDrawType] = useState<DrawType>('random')
  const [format, setFormat] = useState<MatchFormat>('bo1')
  const [thirdPlace, setThirdPlace] = useState<boolean>(false)

  const [groups, setGroups] = useState<Group[]>([
    { id: 'g1', name: 'Group A', teamIds: [] },
    { id: 'g2', name: 'Group B', teamIds: [] }
  ])
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(Math.max(2, Math.floor(baseTeams.length / 2)))
  const [qualifyPerGroup, setQualifyPerGroup] = useState<number>(2)

  const assignedIds = useMemo(() => new Set(groups.flatMap(g => g.teamIds)), [groups])
  const pool = useMemo(() => baseTeams.filter(t => !assignedIds.has(t.id)), [baseTeams, assignedIds])

  const onAutoDistribute = () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const target = groups.map(g => ({ ...g, teamIds: [...g.teamIds] }))
    for (let i = 0; i < target.length; i++) target[i].teamIds = target[i].teamIds.slice(0, teamsPerGroup)
    let gi = 0
    for (const t of shuffled) {
      if (target[gi].teamIds.length < teamsPerGroup) {
        target[gi].teamIds.push(t.id)
      }
      gi = (gi + 1) % target.length
    }
    setGroups(target)
  }

  const onAddGroup = () => {
    const idx = groups.length + 1
    setGroups([...groups, { id: `g${idx}`, name: `Group ${String.fromCharCode(64 + idx)}`, teamIds: [] }])
  }

  const onAddTeamToGroup = (gid: string) => {
    const t = pool[0]
    if (!t) return
    setGroups(prev => prev.map(g => (g.id === gid && g.teamIds.length < teamsPerGroup ? { ...g, teamIds: [...g.teamIds, t.id] } : g)))
  }

  const moveTeam = (fromGid: string, toGid: string, tid: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === fromGid) return { ...g, teamIds: g.teamIds.filter(id => id !== tid) }
        if (g.id === toGid && g.teamIds.length < teamsPerGroup) return { ...g, teamIds: [...g.teamIds, tid] }
        return g
      })
    )
  }

  const renameGroup = (gid: string, name: string) => {
    setGroups(prev => prev.map(g => (g.id === gid ? { ...g, name } : g)))
  }

  const isGroupsValid = useMemo(() => {
    if (groups.length === 0) return false
    for (const g of groups) {
      if (g.teamIds.length === 0) return false
      if (g.teamIds.length % 2 !== 0) return false
    }
    return true
  }, [groups])

  const onSave = async () => {
    if (!tournament) return
    setSaving(true)

    let fixtures: any[] = []

    if (type === 'league') {
      // Simple round robin generator
      // For MVP, we just create a few matches between available teams if not already existing
      for (let r = 1; r <= rounds; r++) {
        for (let i = 0; i < baseTeams.length; i++) {
          for (let j = i + 1; j < baseTeams.length; j++) {
            fixtures.push({
              round: r,
              team_home_id: baseTeams[i].id,
              team_guest_id: baseTeams[j].id,
              status: 'scheduled'
            })
          }
        }
      }
    } else if (type === 'knockout') {
      // Simple knockout - just pair them up for Round 1
      const shuffled = [...baseTeams].sort(() => Math.random() - 0.5)
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
          fixtures.push({
            round: 1,
            team_home_id: shuffled[i].id,
            team_guest_id: shuffled[i + 1].id,
            status: 'scheduled'
          })
        }
      }
    } else if (type === 'hybrid') {
      // Pairs within groups
      groups.forEach(g => {
        for (let i = 0; i < g.teamIds.length; i++) {
          for (let j = i + 1; j < g.teamIds.length; j++) {
            fixtures.push({
              round: 1,
              team_home_id: g.teamIds[i],
              team_guest_id: g.teamIds[j],
              status: 'scheduled'
            })
          }
        }
      })
    }

    const success = await saveTournamentFixtures(tournament.id, fixtures)
    setSaving(false)

    if (success) {
      navigate(`/tournament/${tournament.id}/add-schedule`)
    } else {
      alert('Failed to save rounds. Please try again.')
    }
  }

  if (loading) return <div className="ar-page">Loading...</div>
  if (!tournament) return <div className="ar-page">Tournament not found</div>

  return (
    <div className="ar-page">
      <div className="ar-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(`/tournament/${id}/add-teams`)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20 }}>←</button>
          <div>
            <div className="ar-title">Add Rounds / Groups</div>
            <div className="ar-sub">Tournament: {tournament.name}</div>
          </div>
        </div>
        <div className="ar-tip">Rounds will be auto-generated after you save</div>
      </div>

      <div className="ar-section">
        <div className="ar-section-title">Choose Structure Type</div>
        <div className="ar-card-grid">
          {(['league', 'knockout', 'hybrid'] as StructureType[]).map(k => (
            <button key={k} className={`ar-card ${type === k ? 'active' : ''}`} onClick={() => setType(k)}>
              <div className="ar-card-emoji">{k === 'league' ? '🔵' : k === 'knockout' ? '🔴' : '🟡'}</div>
              <div className="ar-card-title">{k === 'league' ? 'League – Round Robin' : k === 'knockout' ? 'Knockout – Elimination' : 'League + Knockout'}</div>
              <div className="ar-card-sub">
                {k === 'league' ? 'Everyone plays everyone' : k === 'knockout' ? 'Lose = Out' : 'Groups → Final'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {type === 'league' && (
        <div className="ar-section">
          <div className="ar-form-grid">
            <div className="ar-field">
              <label className="ar-label">Number of rounds</label>
              <input
                type="number"
                value={rounds}
                min={1}
                onChange={e => setRounds(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="ar-input"
              />
            </div>
            <div className="ar-field">
              <label className="ar-label">Points for Win</label>
              <input type="number" value={pWin} onChange={e => setPWin(parseInt(e.target.value || '0', 10))} className="ar-input" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Points for Draw</label>
              <input type="number" value={pDraw} onChange={e => setPDraw(parseInt(e.target.value || '0', 10))} className="ar-input" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Points for Loss</label>
              <input type="number" value={pLoss} onChange={e => setPLoss(parseInt(e.target.value || '0', 10))} className="ar-input" />
            </div>
            <div className="ar-field">
              <label className="ar-label">Tiebreaker rule</label>
              <select value={tiebreaker} onChange={e => setTiebreaker(e.target.value as any)} className="ar-select">
                <option value="diff">Point Difference</option>
                <option value="h2h">Head-to-Head</option>
                <option value="coin">Coin Toss</option>
              </select>
            </div>
          </div>
          <div className="ar-preview">
            <div className="ar-preview-title">Points Table Preview</div>
            <div className="ar-table">
              <div className="ar-row head">
                <div className="ar-cell team">Team</div>
                <div className="ar-cell">P</div>
                <div className="ar-cell">W</div>
                <div className="ar-cell">D</div>
                <div className="ar-cell">L</div>
                <div className="ar-cell">Pts</div>
                <div className="ar-cell">Diff</div>
              </div>
              {baseTeams.map(t => (
                <div key={t.id} className="ar-row">
                  <div className="ar-cell team">{t.name}</div>
                  <div className="ar-cell">0</div>
                  <div className="ar-cell">0</div>
                  <div className="ar-cell">0</div>
                  <div className="ar-cell">0</div>
                  <div className="ar-cell">{0}</div>
                  <div className="ar-cell">{0}</div>
                </div>
              ))}
            </div>
            <div className="ar-note">Rounds will be auto-generated after you save</div>
          </div>
        </div>
      )}

      {type === 'knockout' && (
        <div className="ar-section">
          <div className="ar-form-grid">
            <div className="ar-field">
              <label className="ar-label">Draw type</label>
              <select value={drawType} onChange={e => setDrawType(e.target.value as any)} className="ar-select">
                <option value="manual">Manual</option>
                <option value="random">Auto Random</option>
                <option value="seeded">Seeded</option>
              </select>
            </div>
            <div className="ar-field">
              <label className="ar-label">Match format</label>
              <select value={format} onChange={e => setFormat(e.target.value as any)} className="ar-select">
                <option value="bo1">Best of 1</option>
                <option value="bo3">Best of 3</option>
              </select>
            </div>
            <div className="ar-field">
              <label className="ar-label">3rd place match</label>
              <label className="ar-toggle">
                <input type="checkbox" checked={thirdPlace} onChange={e => setThirdPlace(e.target.checked)} />
                <span>{thirdPlace ? 'Yes' : 'No'}</span>
              </label>
            </div>
          </div>
          <div className="ar-preview">
            <div className="ar-preview-title">Knockout Configuration</div>
            <div className="ar-summary">
              <div>Draw: {drawType}</div>
              <div>Format: {format === 'bo1' ? 'Best of 1' : 'Best of 3'}</div>
              <div>Third place: {thirdPlace ? 'Enabled' : 'Disabled'}</div>
            </div>
            <div className="ar-note">Rounds will be auto-generated after you save</div>
          </div>
        </div>
      )}

      {type === 'hybrid' && (
        <div className="ar-section">
          <div className="ar-subtitle">Step A: Set up groups</div>
          <div className="ar-tools">
            <div className="ar-field">
              <label className="ar-label">Teams per group</label>
              <input
                type="number"
                value={teamsPerGroup}
                min={2}
                onChange={e => setTeamsPerGroup(Math.max(2, parseInt(e.target.value || '2', 10)))}
                className="ar-input"
              />
            </div>
            <button className="ar-secondary" onClick={onAutoDistribute}>Auto-distribute</button>
            <button className="ar-secondary" onClick={onAddGroup}>+ Add New Group</button>
          </div>

          <div className="ar-group-grid">
            {groups.map((g, gi) => (
              <div key={g.id} className="ar-group">
                <input value={g.name} onChange={e => renameGroup(g.id, e.target.value)} className="ar-group-name" />
                <div className="ar-group-list">
                  {g.teamIds.map(tid => {
                    const t = baseTeams.find(x => x.id === tid)!
                    const left = groups[gi - 1]?.id
                    const right = groups[gi + 1]?.id
                    return (
                      <div key={tid} className="ar-group-item">
                        <div className="ar-team-name">{t.name}</div>
                        <div className="ar-move">
                          {left && <button className="ar-mini" onClick={() => moveTeam(g.id, left, tid)}>←</button>}
                          {right && <button className="ar-mini" onClick={() => moveTeam(g.id, right, tid)}>→</button>}
                        </div>
                      </div>
                    )
                  })}
                  {g.teamIds.length < teamsPerGroup && (
                    <button className="ar-secondary" onClick={() => onAddTeamToGroup(g.id)}>+ Add Team</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="ar-subtitle">Step B: How many qualify from each group?</div>
          <div className="ar-field">
            <select value={qualifyPerGroup} onChange={e => setQualifyPerGroup(parseInt(e.target.value || '1', 10))} className="ar-select">
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
          </div>

          <div className="ar-subtitle">Step C: Knockout bracket from there</div>
          <div className="ar-summary">
            <div>{groups.length} groups • {teamsPerGroup} per group • Top {qualifyPerGroup} qualify</div>
          </div>

          <div className="ar-preview">
            <div className="ar-preview-title">Points Table Structure Preview</div>
            <div className="ar-group-preview">
              {groups.map(g => (
                <div key={g.id} className="ar-group-block">
                  <div className="ar-group-title">{g.name}</div>
                  <div className="ar-table">
                    <div className="ar-row head">
                      <div className="ar-cell team">Team</div>
                      <div className="ar-cell">P</div>
                      <div className="ar-cell">W</div>
                      <div className="ar-cell">D</div>
                      <div className="ar-cell">L</div>
                      <div className="ar-cell">Pts</div>
                      <div className="ar-cell">Diff</div>
                    </div>
                    {g.teamIds.map(tid => {
                      const t = baseTeams.find(x => x.id === tid)!
                      return (
                        <div key={tid} className="ar-row">
                          <div className="ar-cell team">{t.name}</div>
                          <div className="ar-cell">0</div>
                          <div className="ar-cell">0</div>
                          <div className="ar-cell">0</div>
                          <div className="ar-cell">0</div>
                          <div className="ar-cell">0</div>
                          <div className="ar-cell">0</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="ar-note">Validation: must have even number of teams in groups</div>
          </div>
        </div>
      )}

      <div className="ar-foot">
        <button className="ar-outline" onClick={() => navigate(`/tournament/${tournament.id}/add-teams`)}>Back to Add Teams</button>
        <button className="ar-primary" onClick={onSave} disabled={(type === 'hybrid' && !isGroupsValid) || saving}>
          {saving ? 'Generating Rounds...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  )
}