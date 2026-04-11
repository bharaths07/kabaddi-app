import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCreationState, saveToss } from '../../state/matchCreationStore'
import { upsertFromDraft, setToss as setLiveToss } from '../../state/matchStore'
import { getConfig as getDraftConfig } from '../../state/createDraft'
import './create-match.css'

type CoinFace = 'heads' | 'tails'

export default function TossScreen() {
  const navigate = useNavigate()
  const state = getCreationState()
  const [calledBy, setCalledBy] = useState<'A' | 'B'>('A')
  const [calledChoice, setCalledChoice] = useState<CoinFace>('heads')
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<CoinFace | null>(null)
  const [decision, setDecision] = useState<'raid_first' | 'court_side'>('raid_first')
  const [flipCount, setFlipCount] = useState(0)

  useEffect(() => {
    if (!state?.teamA || !state?.teamB) navigate('/kabaddi/create/teams')
  }, [])

  const winner = result
    ? (calledChoice === result ? calledBy : calledBy === 'A' ? 'B' : 'A')
    : null

  const raidingFirst = winner
    ? (decision === 'raid_first' ? winner : winner === 'A' ? 'B' : 'A')
    : null

  const flipCoin = () => {
    if (flipping) return
    setFlipping(true)
    setResult(null)
    setFlipCount(c => c + 1)
    setTimeout(() => {
      const r: CoinFace = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(r)
      setFlipping(false)
    }, 1800)
  }

  const handleStart = async () => {
    if (!winner || !raidingFirst || !teamA || !teamB) return
    
    // 1. Save to wizard store
    saveToss({
      calledBy,
      calledChoice,
      result: result!,
      winner,
      decision,
      raidingFirst,
    })

    // 2. Finalize and bridge to scoring system (matchStore)
    const draftConfig = getDraftConfig()
    const match = await upsertFromDraft({
      teamAId: teamA.id,
      teamBId: teamB.id,
      config: draftConfig || {}
    })

    if (match) {
      setLiveToss({
        calledByTeamId: winner === 'A' ? teamA.id : teamB.id, // This is actually calledBy, but matchStore expects winner/decision context
        calledChoice: calledChoice,
        result: result!,
        winnerTeamId: winner === 'A' ? teamA.id : teamB.id,
        decision,
        firstRaidTeamId: raidingFirst === 'A' ? teamA.id : teamB.id
      })
      
      // Navigate to live scorer with the NEW match ID (could be Supabase UUID)
      navigate(`/matches/${match.id}/live`)
    } else {
      // Fallback to local ID if upsert fails
      const matchId = state?.matchId || 'local'
      navigate(`/matches/${matchId}/live`)
    }
  }

  const teamA = state?.teamA
  const teamB = state?.teamB
  const callerTeam = calledBy === 'A' ? teamA : teamB
  const winnerTeam = winner === 'A' ? teamA : teamB
  const raidingTeam = raidingFirst === 'A' ? teamA : teamB

  return (
    <div className="cm-page">
      <div className="cm-header">
        <button className="cm-back" onClick={() => navigate('/kabaddi/create/lineup')}>BACK</button>
        <div className="cm-header-title">The Toss</div>
        <div className="cm-step-badge">STEP 4/4</div>
      </div>

      <div className="cm-steps">
        {['Teams', 'Setup', 'Lineup', 'Toss'].map((s, i) => (
          <div key={s} className={`cm-step ${i === 3 ? 'active' : i < 3 ? 'done' : ''}`}>
            <div className="cm-step-dot">{i < 3 ? '✓' : i + 1}</div>
            <div className="cm-step-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="cm-body">
        {/* Teams display */}
        <div className="cm-toss-teams" style={{animation: 'fadeIn 0.6s ease-out'}}>
          <div className="cm-toss-team" style={{ borderColor: teamA?.color, background: `${teamA?.color}05` }}>
            <div className="cm-toss-team-badge" style={{ background: teamA?.color, color: 'white', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{teamA?.short}</div>
            <div className="cm-toss-team-name" style={{ fontWeight: 800 }}>{teamA?.name}</div>
          </div>
          <div className="cm-toss-vs">VS</div>
          <div className="cm-toss-team" style={{ borderColor: teamB?.color, background: `${teamB?.color}05` }}>
            <div className="cm-toss-team-badge" style={{ background: teamB?.color, color: 'white', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{teamB?.short}</div>
            <div className="cm-toss-team-name" style={{ fontWeight: 800 }}>{teamB?.name}</div>
          </div>
        </div>

        {/* Who calls */}
        <div className="cm-section">
          <div className="cm-section-title">Who calls the toss?</div>
          <div className="cm-toss-caller">
            <button
              className={`cm-caller-btn ${calledBy === 'A' ? 'active' : ''}`}
              style={calledBy === 'A' ? { borderColor: teamA?.color, background: `${teamA?.color}15` } : {}}
              onClick={() => setCalledBy('A')}
            >
              {teamA?.name}
            </button>
            <button
              className={`cm-caller-btn ${calledBy === 'B' ? 'active' : ''}`}
              style={calledBy === 'B' ? { borderColor: teamB?.color, background: `${teamB?.color}15` } : {}}
              onClick={() => setCalledBy('B')}
            >
              {teamB?.name}
            </button>
          </div>
        </div>

        {/* Call choice */}
        <div className="cm-section" style={{animation: 'fadeInUp 0.4s ease-out both'}}>
          <div className="cm-section-title">{callerTeam?.name} calls</div>
          <div className="cm-coin-choice">
            <button
              className={`cm-choice-btn ${calledChoice === 'heads' ? 'active' : ''}`}
              onClick={() => !flipping && setCalledChoice('heads')}
            >
              <div className="cm-coin-face heads" style={{fontFamily: 'var(--font-display)', fontWeight: 900}}>H</div>
              <span style={{fontWeight: 900}}>Heads</span>
            </button>
            <button
              className={`cm-choice-btn ${calledChoice === 'tails' ? 'active' : ''}`}
              onClick={() => !flipping && setCalledChoice('tails')}
            >
              <div className="cm-coin-face tails" style={{fontFamily: 'var(--font-display)', fontWeight: 900}}>T</div>
              <span style={{fontWeight: 900}}>Tails</span>
            </button>
          </div>
        </div>

        {/* Coin */}
        <div className="cm-coin-section">
          <div
            className={`cm-coin ${flipping ? 'flipping' : ''} ${result ? 'landed' : ''}`}
            key={flipCount}
            onClick={flipCoin}
          >
            <div className="cm-coin-inner">
              <div className="cm-coin-front">H</div>
              <div className="cm-coin-back">T</div>
            </div>
          </div>

          {!result && !flipping && (
            <button className="cm-flip-btn" onClick={flipCoin}>
              Flip Coin
            </button>
          )}

          {flipping && (
            <div className="cm-flip-status">Flipping...</div>
          )}

          {result && (
            <div className="cm-result-banner">
              <div className="cm-result-face">{result === 'heads' ? 'Heads!' : 'Tails!'}</div>
              <div className="cm-result-winner" style={{ color: winnerTeam?.color }}>
                🎉 {winnerTeam?.name} wins the toss!
              </div>
            </div>
          )}
        </div>

        {/* Winner's decision */}
        {winner && (
          <div className="cm-section" style={{animation: 'fadeInUp 0.4s ease-out both'}}>
            <div className="cm-section-title">{winnerTeam?.name} chooses to...</div>
            <div className="cm-decision-btns">
              <button
                className={`cm-decision-btn ${decision === 'raid_first' ? 'active' : ''}`}
                onClick={() => setDecision('raid_first')}
              >
                <div className="cm-decision-icon" style={{fontSize: '32px'}}>🏐</div>
                <div className="cm-decision-label">Raid First</div>
                <div className="cm-decision-sub">Attack in 1st half</div>
              </button>
              <button
                className={`cm-decision-btn ${decision === 'court_side' ? 'active' : ''}`}
                onClick={() => setDecision('court_side')}
              >
                <div className="cm-decision-icon" style={{fontSize: '32px'}}>🏟️</div>
                <div className="cm-decision-label">Choose Side</div>
                <div className="cm-decision-sub">Pick court side</div>
              </button>
            </div>

            {raidingTeam && (
              <div className="cm-raid-first-banner" style={{ borderBottom: `4px solid ${raidingTeam.color}` }}>
                <span style={{ color: raidingTeam.color, fontWeight: 900, marginRight: '4px' }}>{raidingTeam.name}</span>
                <span>starts the match with the first raid</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="cm-footer">
        <button
          className={`cm-next-btn ${result ? 'ready' : ''}`}
          disabled={!result}
          onClick={handleStart}
          style={result ? { background: 'var(--color-green)', boxShadow: 'var(--shadow-green)' } : {}}
        >
          {result ? 'START PRO MATCH 🚀' : 'FLIP COIN TO START'}
        </button>
      </div>
    </div>
  )
}