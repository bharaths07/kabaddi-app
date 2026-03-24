import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './squad.css'
import { getDraft, setSquad } from '../../state/createDraft'

type Player = { id: string; name: string; phone?: string; isCaptain?: boolean }

export default function SquadOnboarding() {
  const navigate = useNavigate()
  const draft = useMemo(() => getDraft(), [])

  const [playersA, setPlayersA] = useState<Player[]>([])
  const [playersB, setPlayersB] = useState<Player[]>([])
  const [sheetOpen, setSheetOpen] = useState<{ team: 'a' | 'b' } | null>(null)
  const [inviteTab, setInviteTab] = useState<'phone' | 'whatsapp' | 'link'>('phone')
  const [pName, setPName] = useState('')
  const [pPhone, setPPhone] = useState('')

  const teamAName = draft.teamA?.name || 'Team A'
  const teamBName = draft.teamB?.name || 'Team B'

  const addPlayer = (team: 'a' | 'b', name: string, phone?: string) => {
    const make = (prev: Player[]) => {
      const isFirst = prev.length === 0
      const p: Player = { id: `${Date.now()}`, name, phone, isCaptain: isFirst }
      return [p, ...prev]
    }
    if (team === 'a') setPlayersA(prev => make(prev))
    else setPlayersB(prev => make(prev))
  }

  const makeCaptain = (team: 'a' | 'b', id: string) => {
    const promote = (list: Player[]) => list.map(p => ({ ...p, isCaptain: p.id === id }))
    if (team === 'a') setPlayersA(prev => promote(prev))
    else setPlayersB(prev => promote(prev))
  }

  const readyA = playersA.length >= 4 && playersA.some(p => p.isCaptain)
  const readyB = playersB.length >= 4 && playersB.some(p => p.isCaptain)
  const canStart = readyA && readyB

  const needMoreA = Math.max(0, 4 - playersA.length)
  const needMoreB = Math.max(0, 4 - playersB.length)

  const onSubmitPhone = () => {
    const nm = pName.trim()
    if (!nm) return
    addPlayer(sheetOpen?.team || 'a', nm, pPhone.trim() || undefined)
    setPName(''); setPPhone('')
    setSheetOpen(null)
  }

  const shareText = `Join our Kabaddi squad for ${sheetOpen?.team === 'a' ? teamAName : teamBName}.`
  const shareLink = `${window.location.origin}/kabaddi/create/squad?join=${sheetOpen?.team || 'a'}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareLink}`)}`

  return (
    <div className="sq-page">
      <div className="sq-header">
        <button className="sq-back" onClick={() => navigate(-1)}>←</button>
        <div className="sq-title">Squad Onboarding</div>
        <div />
      </div>

      <div className="sq-banner">
        <div className="sq-team">
          <div className="sq-avatar">{teamAName.slice(0,2).toUpperCase()}</div>
          <div className="sq-name">{teamAName}</div>
          <div className="sq-sub">{draft.teamA?.location || 'Varadanayakanahalli'}</div>
        </div>
        <div className="sq-vs">vs</div>
        <div className="sq-team">
          <div className="sq-avatar">{teamBName.slice(0,2).toUpperCase()}</div>
          <div className="sq-name">{teamBName}</div>
          <div className="sq-sub">{draft.teamB?.location || 'Bengaluru'}</div>
        </div>
      </div>

      <TeamBlock
        title={teamAName}
        location={draft.teamA?.location || 'Varadanayakanahalli'}
        players={playersA}
        needMore={needMoreA}
        onAdd={() => setSheetOpen({ team: 'a' })}
        onPromote={(id) => makeCaptain('a', id)}
      />

      <TeamBlock
        title={teamBName}
        location={draft.teamB?.location || 'Bengaluru'}
        players={playersB}
        needMore={needMoreB}
        onAdd={() => setSheetOpen({ team: 'b' })}
        onPromote={(id) => makeCaptain('b', id)}
      />

      <div className="sq-footer-note">
        Both teams need at least 4 players with a captain
      </div>
      <div className="sq-footer">
        <button className={`sq-start ${canStart ? 'ready' : ''}`} disabled={!canStart} onClick={()=>{
          setSquad('a', playersA.map((p, i) => ({ ...p, jerseyNumber: i + 1 })))
          setSquad('b', playersB.map((p, i) => ({ ...p, jerseyNumber: i + 1 })))
          navigate('/kabaddi/create/toss')
        }}>
          {canStart ? 'Start Match' : 'Complete Squads to Start'}
        </button>
      </div>

      {sheetOpen && (
        <>
          <div className="sq-overlay" onClick={()=>setSheetOpen(null)} />
          <div className="sq-sheet">
            <div className="sq-handle" />
            <div className="sq-sheet-title">Add Player</div>
            <div className="sq-tabs">
              {['phone','whatsapp','link'].map(k => (
                <button key={k} className={`sq-tab ${inviteTab===k?'active':''}`} onClick={()=>setInviteTab(k as any)}>
                  {k==='phone'?'Phone':k==='whatsapp'?'WhatsApp':'Link'}
                </button>
              ))}
            </div>
            {inviteTab==='phone' && (
              <div className="sq-form">
                <input className="sq-input" placeholder="Player name *" value={pName} onChange={e=>setPName(e.target.value)} />
                <input className="sq-input" placeholder="+91 phone (optional)" value={pPhone} onChange={e=>setPPhone(e.target.value)} />
                <button className="sq-primary" disabled={!pName.trim()} onClick={onSubmitPhone}>Add</button>
              </div>
            )}
            {inviteTab==='whatsapp' && (
              <div className="sq-share">
                <a className="sq-wa" href={waHref} target="_blank" rel="noreferrer">Share on WhatsApp</a>
              </div>
            )}
            {inviteTab==='link' && (
              <div className="sq-share">
                <div className="sq-linkbox">{shareLink}</div>
                <div className="sq-share-row">
                  <button className="sq-secondary" onClick={()=>navigator.clipboard.writeText(shareLink)}>Copy Link</button>
                  <button className="sq-secondary" onClick={()=>window.open(`mailto:?subject=Join Kabaddi Squad&body=${encodeURIComponent(shareText+' '+shareLink)}`,'_blank')}>Email</button>
                  <button className="sq-secondary" onClick={()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,'_blank')}>Facebook</button>
                  <button className="sq-secondary" onClick={()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareLink)}`,'_blank')}>Twitter</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function TeamBlock({ title, location, players, needMore, onAdd, onPromote }:{
  title: string
  location?: string
  players: Player[]
  needMore: number
  onAdd: () => void
  onPromote: (id: string) => void
}) {
  const pct = Math.min(100, Math.round((players.length/7)*100))
  return (
    <div className="sq-card">
      <div className="sq-card-head">
        <div className="sq-card-title">
          <div className="sq-mini-avatar">{title.slice(0,2).toUpperCase()}</div>
          <div className="sq-title-texts">
            <div className="sq-ctitle">{title}</div>
            {location && <div className="sq-csub">{location}</div>}
          </div>
        </div>
        <div className="sq-need">{needMore>0 ? `⚠ Need ${needMore} more` : 'Ready'} <span className="sq-count">{players.length}/7 players</span></div>
      </div>
      <div className="sq-info">
        <div className="sq-info-icon">i</div>
        <div className="sq-info-text">Minimum 4 players required (including 1 captain) to start a match.</div>
      </div>
      <div className="sq-progress">
        <div className="sq-track"><div className="sq-fill" style={{width:`${pct}%`}} /></div>
      </div>
      <div className="sq-list">
        {players.map(p => (
          <div key={p.id} className="sq-row">
            <div className="sq-row-left">
              <div className="sq-pavatar">{p.name.slice(0,2).toUpperCase()}</div>
              <div className="sq-pinfo">
                <div className="sq-pname">{p.name} {p.isCaptain && <span className="sq-star">⭐</span>}</div>
                {p.phone && <div className="sq-psub">+91 {p.phone}</div>}
              </div>
            </div>
            {!p.isCaptain && <button className="sq-make" onClick={()=>onPromote(p.id)}>Make Captain</button>}
          </div>
        ))}
      </div>
      <button className="sq-add" onClick={onAdd}>+ Add Player</button>
    </div>
  )
}
