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
    <div className="kc-page">
      <div className="kc-header">
        <button className="kc-back" onClick={goBack}>←</button>
        <div className="kc-title">Select playing teams</div>
        <button className="kc-help">?</button>
      </div>
      <div className="kc-sub">Scoring a match is free.</div>
      <div className="kc-stack">
        <div className="kc-circle" onClick={() => handleSelect('a')}>{teamA ? teamA.name.slice(0,2).toUpperCase() : '+'}</div>
        <button className="kc-select" onClick={() => handleSelect('a')}>{teamA ? teamA.name : 'Select team A'}</button>
        <div className="kc-vs">vs</div>
        <div className="kc-circle" onClick={() => handleSelect('b')}>{teamB ? teamB.name.slice(0,2).toUpperCase() : '+'}</div>
        <button className="kc-select" onClick={() => handleSelect('b')}>{teamB ? teamB.name : 'Select team B'}</button>
      </div>
      {teamA && teamB && (
        <div style={{marginTop:12}}>
          <button className="kc-select" onClick={() => navigate('/kabaddi/create/start')}>Next</button>
        </div>
      )}
    </div>
  )
}
