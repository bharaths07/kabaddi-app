import React, { useMemo, useState } from 'react'
import './create-tournament.css'
import { Link, useNavigate } from 'react-router-dom'
import { saveDraft, getDraft, saveTournamentDraft } from '../../shared/state/tournamentDraftStore'

export default function CreateTournament() {
  const initial = useMemo(() => getDraft(), [])
  const [step, setStep] = useState<1|2|3|4>(1)

  // Step 1: Identity
  const [name, setName] = useState(initial.name || '')
  const [logo, setLogo] = useState<string | undefined>(initial.logo)
  const [organizer, setOrganizer] = useState(initial.organizer || 'User')
  const [contact, setContact] = useState(initial.contact || '')

  // Step 2: Logistics
  const [level, setLevel] = useState(initial.level || 'local')
  const [registrationDeadline, setRegistrationDeadline] = useState<string>(initial.registrationDeadline || '')
  const [startDate, setStartDate] = useState<string>(initial.startDate || '')
  const [endDate, setEndDate] = useState<string>(initial.endDate || '')
  const [venueName, setVenueName] = useState<string>(initial.venueName || '')
  const [cityState, setCityState] = useState<string>(initial.cityState || '')
  const [mapsLink, setMapsLink] = useState<string>(initial.mapsLink || '')
  const [courtsAvailable, setCourtsAvailable] = useState<number>(initial.courtsAvailable || 1)

  // Step 3: Rules & Prizes
  const [format, setFormat] = useState(initial.format || 'league')
  const [halfDuration, setHalfDuration] = useState<number>(initial.halfDuration || 20)
  const [playersOnCourt, setPlayersOnCourt] = useState<number>(initial.playersOnCourt || 7)
  const [squadSize, setSquadSize] = useState<number>(initial.squadSize || 12)
  const [timeoutsPerHalf, setTimeoutsPerHalf] = useState<number>(initial.timeoutsPerHalf || 2)
  const [superTackleEnabled, setSuperTackleEnabled] = useState<boolean>(initial.superTackleEnabled ?? true)
  const [bonusPointEnabled, setBonusPointEnabled] = useState<boolean>(initial.bonusPointEnabled ?? true)
  const [scoringNotes, setScoringNotes] = useState<string>(initial.scoringNotes || '')
  const [entryFee, setEntryFee] = useState(initial.entryFee ?? '')
  const [prize, setPrize] = useState(initial.prize || '')

  const [tid, setTid] = useState<string>(initial.id || String(Date.now()))
  const [saving, setSaving] = useState(false)

  // Validation
  const canNextStep1 = name.trim().length > 0 && organizer.trim().length > 0
  const canNextStep2 = level.trim().length > 0
  const canSubmit = true

  const onUpload = (f: File | null) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setLogo(String(reader.result))
    reader.readAsDataURL(f)
  }

  const saveStateToDraft = () => {
    saveDraft({
      id: tid, name, level, organizer, contact, entryFee, prize, logo,
      format, halfDuration, playersOnCourt, squadSize, timeoutsPerHalf,
      superTackleEnabled, bonusPointEnabled, scoringNotes,
      registrationDeadline, startDate, endDate, venueName, cityState,
      mapsLink, courtsAvailable
    })
  }

  const onNext = async () => {
    if (step === 1) {
      saveStateToDraft()
      setStep(2)
      return
    }
    if (step === 2) {
      saveStateToDraft()
      setStep(3)
      return
    }
    if (step === 3) {
      try {
        setSaving(true)
        const id = await saveTournamentDraft({
          id: tid, name, level, organizer, contact, entryFee, prize, logo,
          format, halfDuration, playersOnCourt, squadSize, timeoutsPerHalf,
          superTackleEnabled, bonusPointEnabled, scoringNotes,
          registrationDeadline, startDate, endDate, venueName, cityState,
          mapsLink, courtsAvailable
        })
        setTid(id)
        setStep(4)
      } catch (e) {
        console.error('Failed to save tournament draft to Supabase, using local draft id instead', e)
        setStep(4)
      } finally {
        setSaving(false)
      }
    }
  }

  const onBack = () => {
    if (step > 1 && step < 4) setStep((step - 1) as 1|2|3)
  }

  const renderStepper = () => {
    if (step === 4) return null;
    return (
      <div className="ct-stepper">
        <div className="ct-stepper-line">
          <div className="ct-stepper-progress" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        </div>
        <div className={`ct-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="ct-step-circle">{step > 1 ? '✓' : '1'}</div>
          <div className="ct-step-label">Identity</div>
        </div>
        <div className={`ct-step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="ct-step-circle">{step > 2 ? '✓' : '2'}</div>
          <div className="ct-step-label">Logistics</div>
        </div>
        <div className={`ct-step-indicator ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <div className="ct-step-circle">{step > 3 ? '✓' : '3'}</div>
          <div className="ct-step-label">Rules</div>
        </div>
      </div>
    )
  }

  return (
    <div className="ct-page">
      <div className="ct-header">
        <h1 className="ct-title">Create Tournament</h1>
        {step !== 4 && <div className="ct-sub">Step {step} of 3</div>}
      </div>

      {renderStepper()}

      {step === 1 && (
        <div className="ct-section">
          <div className="ct-section-title">Tournament Identity</div>
          
          <div className="ct-field">
            <label className="ct-label">Tournament Banner / Logo</label>
            <div className="ct-upload">
              {logo ? <img src={logo} alt="Logo preview" className="ct-logo" /> : <div className="ct-logo placeholder">Logo</div>}
              <label className="ct-upload-btn">
                <input type="file" accept="image/*" onChange={e=>onUpload(e.target.files?.[0] || null)} />
                <span>Upload Logo</span>
              </label>
            </div>
          </div>

          <div className="ct-field">
            <label className="ct-label">Tournament Name</label>
            <input className="ct-input" placeholder='e.g. "Zilla Kabaddi Cup"' value={name} onChange={e=>setName(e.target.value)} autoFocus />
          </div>

          <div className="ct-grid-2">
            <div className="ct-field">
              <label className="ct-label">Organizer Name</label>
              <input className="ct-input" placeholder="Your name or club" value={organizer} onChange={e=>setOrganizer(e.target.value)} />
            </div>
            <div className="ct-field">
              <label className="ct-label">Contact Number</label>
              <input className="ct-input" placeholder="+91" value={contact} onChange={e=>setContact(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ct-section">
          <div className="ct-section-title">Location & Schedule</div>

          <div className="ct-field">
            <label className="ct-label">Tournament Level</label>
            <select className="ct-input" value={level} onChange={e=>setLevel(e.target.value as any)}>
              <option value="local">Local / Village</option>
              <option value="district">District</option>
              <option value="state">State</option>
              <option value="national">National</option>
            </select>
          </div>

          <div className="ct-grid-3">
            <div className="ct-field">
              <label className="ct-label">Reg. Deadline</label>
              <input className="ct-input" type="date" value={registrationDeadline} onChange={e=>setRegistrationDeadline(e.target.value)} />
            </div>
            <div className="ct-field">
              <label className="ct-label">Start Date</label>
              <input className="ct-input" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
            </div>
            <div className="ct-field">
              <label className="ct-label">End Date</label>
              <input className="ct-input" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="ct-grid-2">
            <div className="ct-field">
              <label className="ct-label">Venue Name</label>
              <input className="ct-input" placeholder="e.g. Nehru Stadium, Pune" value={venueName} onChange={e=>setVenueName(e.target.value)} />
            </div>
            <div className="ct-field">
              <label className="ct-label">City & State</label>
              <input className="ct-input" placeholder="City, State" value={cityState} onChange={e=>setCityState(e.target.value)} />
            </div>
          </div>

          <div className="ct-grid-2">
            <div className="ct-field">
              <label className="ct-label">Google Maps Link</label>
              <input className="ct-input" placeholder="https://maps.google.com/..." value={mapsLink} onChange={e=>setMapsLink(e.target.value)} />
            </div>
            <div className="ct-field">
              <label className="ct-label">Number of Courts</label>
              <input className="ct-input" type="number" min={1} max={6} value={courtsAvailable} onChange={e=>setCourtsAvailable(Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ct-section">
          <div className="ct-section-title">Kabaddi Rules & Prizes</div>

          <div className="ct-field">
            <label className="ct-label">Tournament Format</label>
            <div className="ct-options">
              <div className={`ct-option ${format==='league'?'active':''}`} onClick={()=>setFormat('league')}>League</div>
              <div className={`ct-option ${format==='knockout'?'active':''}`} onClick={()=>setFormat('knockout')}>Knockout</div>
              <div className={`ct-option ${format==='league_knockout'?'active':''}`} onClick={()=>setFormat('league_knockout')}>League + KO</div>
            </div>
          </div>

          <div className="ct-grid-3">
            <div className="ct-field">
              <label className="ct-label">Half Duration</label>
              <select className="ct-input" value={halfDuration} onChange={e=>setHalfDuration(Number(e.target.value))}>
                <option value={20}>20 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={10}>10 Minutes</option>
              </select>
            </div>
            <div className="ct-field">
              <label className="ct-label">Players On Court</label>
              <input className="ct-input" type="number" min={5} max={9} value={playersOnCourt} onChange={e=>setPlayersOnCourt(Number(e.target.value))}/>
            </div>
            <div className="ct-field">
              <label className="ct-label">Squad Size</label>
              <input className="ct-input" type="number" min={10} max={20} value={squadSize} onChange={e=>setSquadSize(Number(e.target.value))}/>
            </div>
          </div>

          <div className="ct-toggles">
            <label className="ct-toggle">
              <input type="checkbox" checked={superTackleEnabled} onChange={e=>setSuperTackleEnabled(e.target.checked)} />
              <span>Super Tackle (2 Pts)</span>
            </label>
            <label className="ct-toggle">
              <input type="checkbox" checked={bonusPointEnabled} onChange={e=>setBonusPointEnabled(e.target.checked)} />
              <span>Bonus Line Active</span>
            </label>
          </div>
          
          <div className="ct-field">
            <label className="ct-label">Timeouts Per Team/Half</label>
            <input className="ct-input" type="number" min={0} max={5} value={timeoutsPerHalf} onChange={e=>setTimeoutsPerHalf(Number(e.target.value))}/>
          </div>

          <div className="ct-grid-2">
            <div className="ct-field">
              <label className="ct-label">Entry Fee</label>
              <input className="ct-input" type="number" min={0} placeholder="₹ Per team amount (optional)" value={entryFee} onChange={e=>setEntryFee(e.target.value)} />
            </div>
            <div className="ct-field">
              <label className="ct-label">Prize Details</label>
              <input className="ct-input" placeholder='e.g. "1st: ₹50K, 2nd: ₹25K"' value={prize} onChange={e=>setPrize(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ct-section ct-success">
          <div className="ct-trophy">🏆</div>
          <div className="ct-success-title">Your Kabaddi Tournament is Live!</div>
          <div className="ct-tip">Awesome job setting up {name}. Next, you need to invite teams, set up your groups, and generate the schedule.</div>
          
          <div className="ct-steps">
            <Link className="ct-step" to={`/tournament/${tid}/add-teams`}>
              <span className="ct-step-badge">1</span>
              <span className="ct-step-text">Register & Add Teams</span>
            </Link>
            <Link className="ct-step" to={`/tournament/${tid}/add-rounds`}>
              <span className="ct-step-badge">2</span>
              <span className="ct-step-text">Add Rounds / Groups</span>
            </Link>
            <Link className="ct-step" to={`/tournament/${tid}/add-schedule`}>
              <span className="ct-step-badge">3</span>
              <span className="ct-step-text">Generate Schedule</span>
            </Link>
          </div>

          <div className="ct-actions">
            <Link className="ct-btn ct-primary" to={`/tournament/${tid}/dashboard`}>Go to Tournament Dashboard</Link>
            <Link className="ct-link" to={`/home`}>Back to Home page</Link>
          </div>
        </div>
      )}

      {step !== 4 && (
        <div className="ct-footer">
          <div className="ct-footer-left">
            <button className="ct-btn ct-secondary" onClick={() => { saveStateToDraft(); alert("Draft saved successfully!")}}>Save Draft</button>
          </div>
          <div className="ct-footer-right">
            {step > 1 && <button className="ct-btn ct-secondary" onClick={onBack}>Back</button>}
            <button 
              className="ct-btn ct-primary" 
              disabled={saving || (step === 1 ? !canNextStep1 : step === 2 ? !canNextStep2 : !canSubmit)} 
              onClick={onNext}
            >
              {step === 3 ? (saving ? 'Saving...' : 'Launch Tournament') : 'Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
