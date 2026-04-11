import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft } from '../../state/createDraft'

export default function KabaddiMatchPreview() {
  const navigate = useNavigate()
  const draft = getDraft()
  const [fade, setFade] = useState(false)

  const teamA = draft.teamA || { name: 'Team A' }
  const teamB = draft.teamB || { name: 'Team B' }
  const logoA = (teamA as any).logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teamA.name}`
  const logoB = (teamB as any).logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teamB.name}`

  useEffect(() => {
    // Premium entry fade animation
    setTimeout(() => setFade(true), 100)
  }, [])

  return (
    <div className="cm-page" style={{justifyContent: 'center', alignItems: 'center', background: 'var(--bg-navy)', overflow: 'hidden'}}>
      
      {/* Background glow effects */}
      <div style={{position:'absolute', top:'-10%', left:'-10%', width:'60vw', height:'60vw', background:'radial-gradient(circle, var(--color-primary-subtle) 0%, transparent 70%)', borderRadius:'50%'}} />
      <div style={{position:'absolute', bottom:'-10%', right:'-10%', width:'60vw', height:'60vw', background:'radial-gradient(circle, var(--color-gold-subtle) 0%, transparent 70%)', borderRadius:'50%'}} />

      <div style={{
        opacity: fade ? 1 : 0, 
        transform: fade ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        display:'flex', flexDirection:'column', alignItems:'center', zIndex:10, width:'100%', maxWidth: '500px'
      }}>
        
        <div style={{fontFamily: 'var(--font-display)', fontSize:'var(--text-base)', fontWeight:900, color:'var(--color-primary)', textTransform:'uppercase', letterSpacing:'3px', marginBottom:'40px', animation: 'fadeIn 1s ease-out'}}>
          Match Ready
        </div>

        <div className="cm-vs-card" style={{width: '90%', marginBottom: '40px', background: 'var(--glass-bg-dark)', borderColor: 'var(--glass-border-dark)'}}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', flex:1}}>
             <div style={{width:'80px', height:'80px', borderRadius:'var(--radius-lg)', background: 'var(--grad-primary)', border:'3px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: 'white'}}>
               {teamA.name.slice(0, 2).toUpperCase()}
             </div>
             <div style={{fontSize: 'var(--text-base)', fontWeight:900, textAlign:'center', fontFamily: 'var(--font-display)', color: 'white'}}>{teamA.name}</div>
          </div>
          
          <div style={{fontSize:'var(--text-xl)', fontWeight:900, color:'var(--text-muted)', padding:'0 16px', fontStyle:'italic', fontFamily: 'var(--font-display)'}}>VS</div>
          
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', flex:1}}>
             <div style={{width:'80px', height:'80px', borderRadius:'var(--radius-lg)', background: 'var(--grad-gold)', border:'3px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: 'white'}}>
               {teamB.name.slice(0, 2).toUpperCase()}
             </div>
             <div style={{fontSize: 'var(--text-base)', fontWeight:900, textAlign:'center', fontFamily: 'var(--font-display)', color: 'white'}}>{teamB.name}</div>
          </div>
        </div>

        <div style={{fontFamily: 'var(--font-display)', fontSize:'var(--text-4xl)', fontWeight:900, letterSpacing:'-2px', marginBottom:'64px', color: 'white'}}>VS</div>

        <button 
          className="cm-next-btn ready"
          onClick={() => navigate('/kabaddi/create/toss')}
          style={{ width: '90%' }}
        >
          Proceed to Toss 🪙
        </button>
      </div>

    </div>
  )
}
