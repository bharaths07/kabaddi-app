import React, { useEffect, useMemo, useState } from 'react'
import './start-match.css'
import { useNavigate } from 'react-router-dom'
import { getDraft, getConfig, setConfig } from '../../state/createDraft'
import { upsertFromDraft } from '../../state/matchStore'
import type { KabaddiMatchConfig } from '../../types/matchConfig'

export default function KabaddiStartMatch() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(getDraft())
  const defaultConfig: KabaddiMatchConfig = useMemo(() => ({
    format: 'standard',
    halfDurationMinutes: 20,
    breakDurationMinutes: 5,
    playersOnCourt: 7,
    substitutesAllowed: 5,
    raidTimeSeconds: 30,
    bonusLineEnabled: true,
    doOrDieEnabled: true,
    superTackleEnabled: true,
    allOutPoints: 2,
    goldenRaidEnabled: false,
    tieBreakerMode: 'golden_raid',
    venue: { city: '', stadium: '', surface: 'mat', indoor: false },
    officials: { referee: '', umpire: '', scorer: '', technicalOfficial: '' }
  }), [])
  const [config, setConfigState] = useState<KabaddiMatchConfig>(getConfig() || defaultConfig)

  useEffect(() => {
    setDraft(getDraft())
  }, [])

  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/kabaddi/create')
  }

  useEffect(() => {
    setConfig(config)
  }, [config])

  const setField = <K extends keyof KabaddiMatchConfig>(k: K, v: KabaddiMatchConfig[K]) => {
    setConfigState(prev => ({ ...prev, [k]: v }))
  }

  const setVenue = <K extends keyof KabaddiMatchConfig['venue']>(k: K, v: KabaddiMatchConfig['venue'][K]) => {
    setConfigState(prev => ({ ...prev, venue: { ...prev.venue, [k]: v } }))
  }

  const setOfficials = <K extends keyof KabaddiMatchConfig['officials']>(k: K, v: KabaddiMatchConfig['officials'][K]) => {
    setConfigState(prev => ({ ...prev, officials: { ...prev.officials, [k]: v } }))
  }

  return (
    <div className="sm-page">
      <div className="sm-header">
        <button className="sm-back" onClick={goBack}>←</button>
        <div className="sm-title">Start a match</div>
        <div />
      </div>

      <div className="sm-versus">
        <div className="sm-team">
          <div className="sm-avatar">{draft.teamA?.name?.slice(0,2).toUpperCase() || 'A'}</div>
          <div className="sm-name">{draft.teamA?.name || 'Team A'}</div>
          <button className="sm-cta" onClick={()=>navigate('/kabaddi/create/squad')}>Squad</button>
        </div>
        <div className="sm-vs">vs</div>
        <div className="sm-team">
          <div className="sm-avatar">{draft.teamB?.name?.slice(0,2).toUpperCase() || 'B'}</div>
          <div className="sm-name">{draft.teamB?.name || 'Team B'}</div>
          <button className="sm-cta" onClick={()=>navigate('/kabaddi/create/squad')}>Squad</button>
        </div>
      </div>

      <div className="sm-section">
        <div className="sm-label">Match type</div>
        <div className="sm-chips">
          <button className={`sm-chip ${config.format==='standard'?'active':''}`} onClick={() => setField('format','standard')}>Standard</button>
          <button className={`sm-chip ${config.format==='short'?'active':''}`} onClick={() => setField('format','short')}>Short</button>
          <button className={`sm-chip ${config.format==='tournament'?'active':''}`} onClick={() => setField('format','tournament')}>Tournament</button>
          <button className={`sm-chip ${config.format==='custom'?'active':''}`} onClick={() => setField('format','custom')}>Custom</button>
        </div>
      </div>

      <div className="sm-section sm-grid-2">
        <div className="sm-field">
          <label className="sm-label">Half Duration (mins) *</label>
          <input className="sm-input" type="number" min={1} value={config.halfDurationMinutes} onChange={e=>setField('halfDurationMinutes', Number(e.target.value))}/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Break Duration (mins)</label>
          <input className="sm-input" type="number" min={0} value={config.breakDurationMinutes} onChange={e=>setField('breakDurationMinutes', Number(e.target.value))}/>
        </div>
      </div>

      <div className="sm-section sm-grid-2">
        <div className="sm-field">
          <label className="sm-label">Raid Timer (sec)</label>
          <input className="sm-input" type="number" min={10} value={config.raidTimeSeconds} onChange={e=>setField('raidTimeSeconds', Number(e.target.value))}/>
        </div>
        <div className="sm-toggles">
          <label className="sm-toggle"><input type="checkbox" checked={config.bonusLineEnabled} onChange={e=>setField('bonusLineEnabled', e.target.checked)}/> <span>Bonus Line</span></label>
          <label className="sm-toggle"><input type="checkbox" checked={config.doOrDieEnabled} onChange={e=>setField('doOrDieEnabled', e.target.checked)}/> <span>Do or Die Raid</span></label>
          <label className="sm-toggle"><input type="checkbox" checked={config.superTackleEnabled} onChange={e=>setField('superTackleEnabled', e.target.checked)}/> <span>Super Tackle</span></label>
        </div>
      </div>

      <div className="sm-section sm-grid-3">
        <div className="sm-field">
          <label className="sm-label">All Out Points</label>
          <input className="sm-input" type="number" min={0} value={config.allOutPoints} onChange={e=>setField('allOutPoints', Number(e.target.value))}/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Golden Raid</label>
          <label className="sm-toggle"><input type="checkbox" checked={config.goldenRaidEnabled} onChange={e=>setField('goldenRaidEnabled', e.target.checked)}/> <span>Enable</span></label>
        </div>
        <div className="sm-field">
          <label className="sm-label">Tie Break Mode</label>
          <select className="sm-input" value={config.tieBreakerMode} onChange={e=>setField('tieBreakerMode', e.target.value as any)}>
            <option value="extra_time">Extra Time</option>
            <option value="golden_raid">Golden Raid</option>
          </select>
        </div>
      </div>

      <div className="sm-section sm-grid-2">
        <div className="sm-field">
          <label className="sm-label">City</label>
          <input className="sm-input" value={config.venue.city} onChange={e=>setVenue('city', e.target.value)} placeholder="City"/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Stadium / Court</label>
          <input className="sm-input" value={config.venue.stadium} onChange={e=>setVenue('stadium', e.target.value)} placeholder="Stadium or Court"/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Surface</label>
          <div className="sm-chips">
            <button className={`sm-chip ${config.venue.surface==='mat'?'active':''}`} onClick={()=>setVenue('surface','mat')}>Mat</button>
            <button className={`sm-chip ${config.venue.surface==='mud'?'active':''}`} onClick={()=>setVenue('surface','mud')}>Mud</button>
          </div>
        </div>
        <div className="sm-field">
          <label className="sm-label">Indoor / Outdoor</label>
          <div className="sm-chips">
            <button className={`sm-chip ${config.venue.indoor?'active':''}`} onClick={()=>setVenue('indoor', true)}>Indoor</button>
            <button className={`sm-chip ${!config.venue.indoor?'active':''}`} onClick={()=>setVenue('indoor', false)}>Outdoor</button>
          </div>
        </div>
      </div>

      <div className="sm-section sm-grid-4">
        <div className="sm-field">
          <label className="sm-label">Referee</label>
          <input className="sm-input" value={config.officials.referee||''} onChange={e=>setOfficials('referee', e.target.value)}/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Umpire</label>
          <input className="sm-input" value={config.officials.umpire||''} onChange={e=>setOfficials('umpire', e.target.value)}/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Scorer</label>
          <input className="sm-input" value={config.officials.scorer||''} onChange={e=>setOfficials('scorer', e.target.value)}/>
        </div>
        <div className="sm-field">
          <label className="sm-label">Technical Official</label>
          <input className="sm-input" value={config.officials.technicalOfficial||''} onChange={e=>setOfficials('technicalOfficial', e.target.value)}/>
        </div>
      </div>

      <div className="sm-footer">
        <button className="sm-secondary">Schedule Match</button>
        <button
          className="sm-primary"
          onClick={() => {
            const teamAId = draft.teamA?.id || 'A'
            const teamBId = draft.teamB?.id || 'B'
            const m = upsertFromDraft({ teamAId, teamBId, config })
            navigate('/kabaddi/create/toss')
          }}
        >
          Next (Toss)
        </button>
      </div>
    </div>
  )
}
