import React, { useEffect, useMemo, useState } from 'react'
import './toss.css'
import { useNavigate } from 'react-router-dom'
import { getCurrentMatch, setStatus, setToss } from '../../state/matchStore'

export default function KabaddiToss() {
  const navigate = useNavigate()
  const match = useMemo(() => getCurrentMatch(), [])
  const [caller, setCaller] = useState<'a' | 'b'>('a')
  const [callChoice, setCallChoice] = useState<'heads' | 'tails'>('heads')
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const teamAName = match?.teamAId || 'Team A'
  const teamBName = match?.teamBId || 'Team B'

  useEffect(() => {
    if (!match) navigate('/kabaddi/create')
  }, [match, navigate])

  const flip = () => {
    if (flipping) return
    setFlipping(true)
    setResult(null)
    setTimeout(() => {
      const r = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(r)
      setFlipping(false)
    }, 1500)
  }

  const winnerTeam = useMemo(() => {
    if (!result || !match) return null
    const callerTeamId = caller === 'a' ? match.teamAId : match.teamBId
    const otherTeamId = caller === 'a' ? match.teamBId : match.teamAId
    const winner = callChoice === result ? callerTeamId : otherTeamId
    return winner
  }, [result, caller, callChoice, match])

  const [decision, setDecision] = useState<'raid_first' | 'court_side'>('raid_first')
  const [courtSide, setCourtSide] = useState<'left' | 'right'>('left')

  const confirm = () => {
    if (!match || !winnerTeam || !result) return
    const calledByTeamId = caller === 'a' ? match.teamAId : match.teamBId
    const otherTeamId = caller === 'a' ? match.teamBId : match.teamAId
    const firstRaidTeamId = decision === 'raid_first' ? winnerTeam : (winnerTeam === match.teamAId ? otherTeamId : match.teamAId)
    setToss({
      calledByTeamId,
      calledChoice: callChoice,
      result,
      winnerTeamId: winnerTeam,
      decision,
      firstRaidTeamId,
      courtSideChoice: decision === 'court_side' ? courtSide : undefined
    })
    setStatus('live')
    navigate(`/kabaddi/matches/${match.id}/live`)
  }

  if (!match) return null

  return (
    <div className="ts-page">
      <div className="ts-header">
        <button className="ts-back" onClick={() => navigate(-1)}>←</button>
        <div className="ts-title">Start a Match</div>
        <div />
      </div>

      <div className="ts-teams">
        <div className="ts-team">
          <div className="ts-avatar">{String(teamAName).slice(0,2).toUpperCase()}</div>
          <div className="ts-name">{teamAName}</div>
        </div>
        <div className="ts-vs">VS</div>
        <div className="ts-team">
          <div className="ts-avatar">{String(teamBName).slice(0,2).toUpperCase()}</div>
          <div className="ts-name">{teamBName}</div>
        </div>
      </div>

      <div className="ts-section">
        <div className="ts-label">Who calls the toss?</div>
        <div className="ts-chips">
          <button className={`ts-chip ${caller==='a'?'active':''}`} onClick={()=>setCaller('a')}>Team A</button>
          <button className={`ts-chip ${caller==='b'?'active':''}`} onClick={()=>setCaller('b')}>Team B</button>
        </div>
        <div className="ts-label">Call</div>
        <div className="ts-chips">
          <button className={`ts-chip ${callChoice==='heads'?'active':''}`} onClick={()=>setCallChoice('heads')}>Heads</button>
          <button className={`ts-chip ${callChoice==='tails'?'active':''}`} onClick={()=>setCallChoice('tails')}>Tails</button>
        </div>
      </div>

      <div className="ts-section">
        <div className="ts-label">Toss</div>
        <div className={`ts-coin ${flipping?'flip':''}`} onClick={flip}>{flipping ? '' : (result ? result.toUpperCase() : 'Flip Toss')}</div>
        {result && (
          <div className="ts-result">
            <div>Result: {result.toUpperCase()}</div>
            <div>Winner: {winnerTeam}</div>
          </div>
        )}
      </div>

      <div className="ts-section">
        <div className="ts-label">Winner decision</div>
        <div className="ts-chips">
          <button className={`ts-chip ${decision==='raid_first'?'active':''}`} onClick={()=>setDecision('raid_first')}>Raid First</button>
          <button className={`ts-chip ${decision==='court_side'?'active':''}`} onClick={()=>setDecision('court_side')}>Choose Court Side</button>
        </div>
        {decision==='court_side' && (
          <div className="ts-chips">
            <button className={`ts-chip ${courtSide==='left'?'active':''}`} onClick={()=>setCourtSide('left')}>Left</button>
            <button className={`ts-chip ${courtSide==='right'?'active':''}`} onClick={()=>setCourtSide('right')}>Right</button>
          </div>
        )}
      </div>

      <div className="ts-footer">
        <button className="ts-secondary" onClick={()=>navigate('/kabaddi/create')}>Back</button>
        <button className="ts-primary" disabled={!result || !winnerTeam} onClick={confirm}>Start Match</button>
      </div>
    </div>
  )
}
