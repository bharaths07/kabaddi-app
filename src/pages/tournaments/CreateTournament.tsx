import React, { useMemo, useState } from 'react'
import './create-tournament.css'
import { saveDraft, getDraft } from '../../shared/state/tournamentDraftStore'

export default function CreateTournament() {
  const initial = useMemo(() => getDraft(), [])
  const [step, setStep] = useState<1|2|3>(1)
  const [name, setName] = useState(initial.name || '')
  const [level, setLevel] = useState(initial.level || 'local')
  const [organizer, setOrganizer] = useState(initial.organizer || 'User')
  const [contact, setContact] = useState(initial.contact || '')
  const [entryFee, setEntryFee] = useState(initial.entryFee ?? '')
  const [prize, setPrize] = useState(initial.prize || '')
  const [logo, setLogo] = useState<string | undefined>(initial.logo)
  const [tid, setTid] = useState<string>(initial.id || String(Date.now()))
  const canNext = name.trim().length > 0 && organizer.trim().length > 0
  const onUpload = (f: File | null) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setLogo(String(reader.result))
    reader.readAsDataURL(f)
  }
  const onNext = () => {
    if (step === 1) {
      saveDraft({ id: tid, name, level, organizer, contact, entryFee, prize, logo })
      setStep(2)
      return
    }
    saveDraft({ id: tid, name, level, organizer, contact, entryFee, prize, logo, format, halfDuration, playersOnCourt, squadSize, timeoutsPerHalf, superTackleEnabled, bonusPointEnabled, scoringNotes, registrationDeadline, startDate, endDate, venueName, cityState, mapsLink, courtsAvailable })
    setStep(3)
  }
  const onBack = () => {
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
  }

  const [format, setFormat] = useState(initial.format || 'league')
  const [halfDuration, setHalfDuration] = useState<number>(initial.halfDuration || 20)
  const [playersOnCourt, setPlayersOnCourt] = useState<number>(initial.playersOnCourt || 7)
  const [squadSize, setSquadSize] = useState<number>(initial.squadSize || 12)
  const [timeoutsPerHalf, setTimeoutsPerHalf] = useState<number>(initial.timeoutsPerHalf || 2)
  const [superTackleEnabled, setSuperTackleEnabled] = useState<boolean>(initial.superTackleEnabled ?? true)
  const [bonusPointEnabled, setBonusPointEnabled] = useState<boolean>(initial.bonusPointEnabled ?? true)
  const [scoringNotes, setScoringNotes] = useState<string>(initial.scoringNotes || '')
  const [registrationDeadline, setRegistrationDeadline] = useState<string>(initial.registrationDeadline || '')
  const [startDate, setStartDate] = useState<string>(initial.startDate || '')
  const [endDate, setEndDate] = useState<string>(initial.endDate || '')
  const [venueName, setVenueName] = useState<string>(initial.venueName || '')
  const [cityState, setCityState] = useState<string>(initial.cityState || '')
  const [mapsLink, setMapsLink] = useState<string>(initial.mapsLink || '')
  const [courtsAvailable, setCourtsAvailable] = useState<number>(initial.courtsAvailable || 1)
  return (
    <div className="ct-page">
      <div className="ct-header">
        <h1 className="ct-title">Create Tournament</h1>
        <div className="ct-sub">{step === 1 ? 'Step 1 • Basic Info' : 'Step 2 • Format & Rules'}</div>
      </div>

      {step === 1 && (
      <div className="ct-section">
        <div className="ct-field">
          <label className="ct-label">Tournament Name</label>
          <input className="ct-input" placeholder='e.g. "Zilla Kabaddi Cup 2025"' value={name} onChange={e=>setName(e.target.value)} />
        </div>

        <div className="ct-field">
          <label className="ct-label">Tournament Banner / Logo</label>
          <div className="ct-upload">
            {logo ? <img src={logo} alt="Logo preview" className="ct-logo" /> : <div className="ct-logo placeholder">Logo</div>}
            <label className="ct-upload-btn">
              <input type="file" accept="image/*" onChange={e=>onUpload(e.target.files?.[0] || null)} />
              <span>Upload</span>
            </label>
          </div>
        </div>

        <div className="ct-grid-2">
          <div className="ct-field">
            <label className="ct-label">Organizer Name</label>
            <input className="ct-input" value={organizer} onChange={e=>setOrganizer(e.target.value)} />
          </div>
          <div className="ct-field">
            <label className="ct-label">Contact Number</label>
            <input className="ct-input" placeholder="+91" value={contact} onChange={e=>setContact(e.target.value)} />
          </div>
        </div>

        <div className="ct-field">
          <label className="ct-label">Tournament Level</label>
          <select className="ct-input" value={level} onChange={e=>setLevel(e.target.value)}>
            <option value="local">Local / Village</option>
            <option value="district">District</option>
            <option value="state">State</option>
            <option value="national">National</option>
          </select>
        </div>

        <div className="ct-grid-2">
          <div className="ct-field">
            <label className="ct-label">Entry Fee (optional)</label>
            <input className="ct-input" type="number" min={0} placeholder="per team amount" value={entryFee} onChange={e=>setEntryFee(e.target.value)} />
          </div>
          <div className="ct-field">
            <label className="ct-label">Prize Details</label>
            <input className="ct-input" placeholder='e.g. "1st: ₹10,000, 2nd: ₹5,000"' value={prize} onChange={e=>setPrize(e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {step === 2 && (
      <div className="ct-section">
        <div className="ct-field">
          <label className="ct-label">Tournament Format</label>
          <div className="ct-options">
            <button className={`ct-option ${format==='league'?'active':''}`} onClick={()=>setFormat('league')}>League</button>
            <button className={`ct-option ${format==='knockout'?'active':''}`} onClick={()=>setFormat('knockout')}>Knockout</button>
            <button className={`ct-option ${format==='league_knockout'?'active':''}`} onClick={()=>setFormat('league_knockout')}>League + Knockout</button>
          </div>
        </div>

        <div className="ct-grid-3">
          <div className="ct-field">
            <label className="ct-label">Each Half</label>
            <select className="ct-input" value={halfDuration} onChange={e=>setHalfDuration(Number(e.target.value))}>
              <option value={20}>20 min</option>
              <option value={15}>15 min</option>
              <option value={10}>10 min</option>
            </select>
          </div>
          <div className="ct-field">
            <label className="ct-label">Players on court</label>
            <input className="ct-input" type="number" min={5} max={9} value={playersOnCourt} onChange={e=>setPlayersOnCourt(Number(e.target.value))}/>
          </div>
          <div className="ct-field">
            <label className="ct-label">Squad size</label>
            <input className="ct-input" type="number" min={10} max={20} value={squadSize} onChange={e=>setSquadSize(Number(e.target.value))}/>
          </div>
        </div>

        <div className="ct-grid-2">
          <div className="ct-field">
            <label className="ct-label">Timeouts per team per half</label>
            <input className="ct-input" type="number" min={0} max={5} value={timeoutsPerHalf} onChange={e=>setTimeoutsPerHalf(Number(e.target.value))}/>
          </div>
          <div className="ct-field">
            <label className="ct-label">Scoring Rules</label>
            <textarea className="ct-textarea" placeholder="Optional custom notes" value={scoringNotes} onChange={e=>setScoringNotes(e.target.value)} />
          </div>
        </div>

        <div className="ct-toggles">
          <label className="ct-toggle"><input type="checkbox" checked={superTackleEnabled} onChange={e=>setSuperTackleEnabled(e.target.checked)} /> <span>Super Tackle</span></label>
          <label className="ct-toggle"><input type="checkbox" checked={bonusPointEnabled} onChange={e=>setBonusPointEnabled(e.target.checked)} /> <span>Bonus Point</span></label>
        </div>

        <div className="ct-section-title">Dates & Venue</div>
        <div className="ct-grid-3">
          <div className="ct-field">
            <label className="ct-label">Registration Deadline</label>
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
            <input className="ct-input" placeholder="Nehru Stadium, Pune" value={venueName} onChange={e=>setVenueName(e.target.value)} />
          </div>
          <div className="ct-field">
            <label className="ct-label">City & State</label>
            <input className="ct-input" placeholder="City, State" value={cityState} onChange={e=>setCityState(e.target.value)} />
          </div>
        </div>
        <div className="ct-grid-2">
          <div className="ct-field">
            <label className="ct-label">Google Maps Link (optional)</label>
            <input className="ct-input" placeholder="https://maps.google.com/..." value={mapsLink} onChange={e=>setMapsLink(e.target.value)} />
          </div>
          <div className="ct-field">
            <label className="ct-label">Number of Courts Available</label>
            <input className="ct-input" type="number" min={1} max={6} value={courtsAvailable} onChange={e=>setCourtsAvailable(Number(e.target.value))} />
          </div>
        </div>
      </div>
      )}

      {step === 3 && (
        <div className="ct-section ct-success">
          <div className="ct-trophy">🏆</div>
          <div className="ct-success-title">Great, your tournament is registered!</div>
          <div className="ct-tip">Teams not available yet? No worries — you can do this later from Dashboard.</div>
          <div className="ct-steps">
            <a className="ct-step" href={`/tournament/${tid}/add-teams`}>
              <span className="ct-step-badge">!</span>
              <span className="ct-step-text">Add Teams</span>
            </a>
            <a className="ct-step" href={`/tournament/${tid}/add-rounds`}>
              <span className="ct-step-badge">!</span>
              <span className="ct-step-text">Add Rounds / Groups</span>
            </a>
            <a className="ct-step" href={`/tournament/${tid}/add-schedule`}>
              <span className="ct-step-badge">!</span>
              <span className="ct-step-text">Add Schedule</span>
            </a>
          </div>
          <div className="ct-actions">
            <a className="ct-primary" href={`/tournament/${tid}/dashboard`}>OK, LET'S GO</a>
            <a className="ct-link" href={`/tournament/${tid}/dashboard`}>Go to Dashboard, I'll do this later</a>
          </div>
        </div>
      )}

      <div className="ct-footer">
        <button className="ct-secondary" onClick={()=>saveDraft({ name, level, organizer, contact, entryFee, prize, logo, format, halfDuration, playersOnCourt, squadSize, timeoutsPerHalf, superTackleEnabled, bonusPointEnabled, scoringNotes, registrationDeadline, startDate, endDate, venueName, cityState, mapsLink, courtsAvailable })}>Save Draft</button>
        {step !== 1 && <button className="ct-secondary" onClick={onBack}>Back</button>}
        {step !== 3 && <button className="ct-primary" disabled={step===1 ? !canNext : false} onClick={onNext}>{step===1?'Next':'Save & Continue'}</button>}
      </div>
    </div>
  )
}
