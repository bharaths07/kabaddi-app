import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCreationState, saveConfig, type MatchConfig } from '../../state/matchCreationStore'
import { setConfig as saveDraftConfig } from '../../state/createDraft'
import './create-match.css'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`cm-toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <div className="cm-toggle-thumb" />
    </div>
  )
}

function Counter({ value, onChange, min = 1, max = 60, suffix = '' }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string
}) {
  return (
    <div className="cm-counter">
      <button className="cm-counter-btn" onClick={() => onChange(Math.max(min, value - (suffix === 'secs' ? 5 : 5)))}>−</button>
      <div className="cm-counter-val">{value}<span className="cm-counter-suffix">{suffix}</span></div>
      <button className="cm-counter-btn" onClick={() => onChange(Math.min(max, value + (suffix === 'secs' ? 5 : 5)))}>+</button>
    </div>
  )
}

export default function MatchSetupScreen() {
  const navigate = useNavigate()
  const state = getCreationState()

  const [config, setConfig] = useState<MatchConfig>({
    title: '',
    type: 'standard',
    halfDuration: 20,
    breakDuration: 5,
    raidTimer: 30,
    allOutPoints: 2,
    bonusLineEnabled: true,
    superTackleEnabled: true,
    doOrDieEnabled: true,
    goldenRaidEnabled: false,
  })

  useEffect(() => {
    if (!state) { navigate('/kabaddi/create/teams'); return }
    if (state.config) setConfig(state.config)
  }, [])

  const set = (key: keyof MatchConfig, val: any) =>
    setConfig(prev => ({ ...prev, [key]: val }))

  const TYPES = [
    { id: 'standard', label: 'Standard', sub: '2 × 20 min', emoji: '🏉' },
    { id: 'quick', label: 'Quick', sub: '2 × 10 min', emoji: '⚡' },
    { id: 'tournament', label: 'Tournament', sub: 'Custom rules', emoji: '🏆' },
  ]

  const handleNext = () => {
    saveConfig(config)
    saveDraftConfig({
      title: config.title,
      format: config.type as any,
      halfDurationMinutes: config.halfDuration,
      breakDurationMinutes: config.breakDuration,
      raidTimeSeconds: config.raidTimer,
      playersOnCourt: 7,
      substitutesAllowed: 5,
      bonusLineEnabled: config.bonusLineEnabled,
      doOrDieEnabled: config.doOrDieEnabled,
      superTackleEnabled: config.superTackleEnabled,
      allOutPoints: config.allOutPoints,
      goldenRaidEnabled: config.goldenRaidEnabled,
      tieBreakerMode: config.goldenRaidEnabled ? 'golden_raid' : 'extra_time',
      venue: { city: 'Local', stadium: 'City Arena', surface: 'mat', indoor: true },
      officials: {}
    })
    navigate('/kabaddi/create/lineup')
  }

  return (
    <div className="cm-page">
      <div className="cm-header">
        <button className="cm-back" onClick={() => navigate('/kabaddi/create/teams')}>BACK</button>
        <div className="cm-header-title">Match Setup</div>
        <div className="cm-step-badge">STEP 2/4</div>
      </div>

      <div className="cm-steps">
        {['Teams', 'Setup', 'Lineup', 'Toss'].map((s, i) => (
          <div key={s} className={`cm-step ${i === 1 ? 'active' : i < 1 ? 'done' : ''}`}>
            <div className="cm-step-dot">{i < 1 ? '✓' : i + 1}</div>
            <div className="cm-step-label">{s}</div>
          </div>
        ))}
      </div>

      {/* Team preview banner */}
      {state?.teamA && state?.teamB && (
        <div className="cm-match-banner" style={{animation: 'fadeIn 0.8s ease-in-out'}}>
          <div className="cm-banner-team" style={{ color: state.teamA.color, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>{state.teamA.name}</div>
          <div className="cm-banner-vs">VS</div>
          <div className="cm-banner-team" style={{ color: state.teamB.color, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>{state.teamB.name}</div>
        </div>
      )}

      <div className="cm-body">
        {/* Match title */}
        <div className="cm-section" style={{animation: 'fadeInUp 0.4s ease-out both'}}>
          <div className="cm-section-title">Match Identity</div>
          <input
            className="cm-input"
            placeholder="e.g. KPL 2026 Quarter Final"
            value={config.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>

        {/* Match type */}
        <div className="cm-section" style={{animation: 'fadeInUp 0.4s ease-out 0.1s both'}}>
          <div className="cm-section-title">Match Format</div>
          <div className="cm-type-grid">
            {TYPES.map(t => (
              <div
                key={t.id}
                className={`cm-type-card ${config.type === t.id ? 'active' : ''}`}
                onClick={() => {
                  set('type', t.id)
                  if (t.id === 'quick') { set('halfDuration', 10); set('raidTimer', 30) }
                  if (t.id === 'standard') { set('halfDuration', 20); set('raidTimer', 30) }
                }}
              >
                <div className="cm-type-emoji">{t.emoji}</div>
                <div className="cm-type-label">{t.label}</div>
                <div className="cm-type-sub">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="cm-section">
          <div className="cm-section-title">Timing</div>
          <div className="cm-config-card">
            <div className="cm-config-row">
              <div className="cm-config-label">
                <div className="cm-config-name">Half Duration</div>
                <div className="cm-config-desc">Each half length</div>
              </div>
              <Counter value={config.halfDuration} onChange={v => set('halfDuration', v)} min={5} max={40} suffix="min" />
            </div>
            <div className="cm-config-divider" />
            <div className="cm-config-row">
              <div className="cm-config-label">
                <div className="cm-config-name">Break Duration</div>
                <div className="cm-config-desc">Half-time break</div>
              </div>
              <Counter value={config.breakDuration} onChange={v => set('breakDuration', v)} min={2} max={15} suffix="min" />
            </div>
            <div className="cm-config-divider" />
            <div className="cm-config-row">
              <div className="cm-config-label">
                <div className="cm-config-name">Raid Timer</div>
                <div className="cm-config-desc">Seconds per raid</div>
              </div>
              <Counter value={config.raidTimer} onChange={v => set('raidTimer', v)} min={20} max={60} suffix="sec" />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="cm-section">
          <div className="cm-section-title">Rules</div>
          <div className="cm-config-card">
            {[
              { key: 'superTackleEnabled', label: 'Super Tackle', desc: '3 or fewer defenders tackle' },
              { key: 'bonusLineEnabled', label: 'Bonus Line', desc: 'Raider crosses bonus line' },
              { key: 'doOrDieEnabled', label: 'Do or Die', desc: 'Must score on 3rd consecutive empty raid' },
              { key: 'goldenRaidEnabled', label: 'Golden Raid', desc: 'Tie-breaker sudden death raid' },
            ].map((rule, i, arr) => (
              <div key={rule.key}>
                <div className="cm-config-row">
                  <div className="cm-config-label">
                    <div className="cm-config-name">{rule.label}</div>
                    <div className="cm-config-desc">{rule.desc}</div>
                  </div>
                  <Toggle
                    value={config[rule.key as keyof MatchConfig] as boolean}
                    onChange={v => set(rule.key as keyof MatchConfig, v)}
                  />
                </div>
                {i < arr.length - 1 && <div className="cm-config-divider" />}
              </div>
            ))}
          </div>
        </div>

        {/* All-Out points */}
        <div className="cm-section">
          <div className="cm-section-title">All-Out Bonus Points</div>
          <div className="cm-config-card">
            <div className="cm-config-row">
              <div className="cm-config-label">
                <div className="cm-config-name">All-Out Points</div>
                <div className="cm-config-desc">Bonus for eliminating all opponents</div>
              </div>
              <Counter value={config.allOutPoints} onChange={v => set('allOutPoints', v)} min={1} max={5} suffix="pts" />
            </div>
          </div>
        </div>
      </div>

      <div className="cm-footer">
        <button className="cm-next-btn ready" onClick={handleNext}>
          Confirm Match Rules
        </button>
      </div>
    </div>
  )
}