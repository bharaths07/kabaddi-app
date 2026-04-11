import React, { useEffect, useState } from 'react'
import './create-match.css'
import { useNavigate } from 'react-router-dom'
import { getDraft } from '../../state/createDraft'

export default function KabaddiCreateMatch() {
  const navigate = useNavigate()
  const [teamA, setTeamA] = useState<{ id: string; name: string } | undefined>()
  const [teamB, setTeamB] = useState<{ id: string; name: string } | undefined>()

  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  useEffect(() => {
    const d = getDraft()
    setTeamA(d.teamA)
    setTeamB(d.teamB)
  }, [])
  useEffect(() => {
    if (teamA && teamB) {
      setTimeout(() => navigate('/kabaddi/create/start'), 150)
    }
  }, [teamA, teamB, navigate])

  const handleSelect = (team: 'a' | 'b') => {
    navigate(`/kabaddi/create/select-team/${team}`)
  }
  return (
    <div className="cm-page">
      <div className="cm-header">
        <button className="cm-back" onClick={goBack}>BACK</button>
        <div className="cm-header-title">Create Match</div>
        <div className="cm-step-badge">STEP 1/4</div>
      </div>
      
      <div className="cm-body">
        <div className="cm-section">
          <div className="cm-section-title">Select Competing Teams</div>
          <div style={{color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)'}}>
            Choose the teams that will be participating in this match.
          </div>
          
          <div className="cm-vs-card" style={{animation: 'fadeInUp 0.6s ease-out both'}}>
            <div className="cm-team-slot" onClick={() => handleSelect('a')}>
              {teamA ? (
                <div className="cm-team-avatar" style={{width: 60, height: 60, background: 'var(--grad-primary)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)'}}>
                  {teamA.name.slice(0,2).toUpperCase()}
                </div>
              ) : (
                <div className="cm-team-slot-empty">+</div>
              )}
              <div className="cm-team-slot-name">{teamA ? teamA.name : 'Select Team A'}</div>
              {teamA && <div className="cm-team-slot-change">Tap to change</div>}
            </div>

            <div className="cm-vs-badge">VS</div>

            <div className="cm-team-slot" onClick={() => handleSelect('b')}>
              {teamB ? (
                <div className="cm-team-avatar" style={{width: 60, height: 60, background: 'var(--grad-gold)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)'}}>
                  {teamB.name.slice(0,2).toUpperCase()}
                </div>
              ) : (
                <div className="cm-team-slot-empty">+</div>
              )}
              <div className="cm-team-slot-name">{teamB ? teamB.name : 'Select Team B'}</div>
              {teamB && <div className="cm-team-slot-change">Tap to change</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="cm-footer">
        {(!teamA || !teamB) && (
          <div className="cm-footer-hint">Please select both teams to continue</div>
        )}
        <button 
          className={`cm-next-btn ${teamA && teamB ? 'ready' : ''}`}
          onClick={() => teamA && teamB && navigate('/kabaddi/create/start')}
          disabled={!teamA || !teamB}
        >
          Setup Match Details
        </button>
      </div>
    </div>
  )
}
