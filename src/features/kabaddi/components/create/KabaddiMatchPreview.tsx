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
    <div style={{minHeight:'100vh', background:'#0f172a', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'var(--font-display)', position:'relative', overflow:'hidden'}}>
      
      {/* Background glow effects */}
      <div style={{position:'absolute', top:'-10%', left:'-10%', width:'60vw', height:'60vw', background:'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)', borderRadius:'50%'}} />
      <div style={{position:'absolute', bottom:'-10%', right:'-10%', width:'60vw', height:'60vw', background:'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius:'50%'}} />

      <div style={{
        opacity: fade ? 1 : 0, 
        transform: fade ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        display:'flex', flexDirection:'column', alignItems:'center', zIndex:10, width:'100%'
      }}>
        
        <div style={{fontSize:'12px', fontWeight:900, color:'#fb923c', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'40px'}}>
          Match Ready
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', maxWidth:'400px', marginBottom:'48px'}}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', flex:1}}>
             <img src={logoA} style={{width:'80px', height:'80px', borderRadius:'50%', border:'4px solid #1e293b', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', objectFit:'cover', background:'#fff'}} />
             <div style={{fontSize:'16px', fontWeight:900, textAlign:'center'}}>{teamA.name}</div>
          </div>
          
          <div style={{fontSize:'24px', fontWeight:900, color:'#cbd5e1', padding:'0 16px', fontStyle:'italic'}}>VS</div>
          
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', flex:1}}>
             <img src={logoB} style={{width:'80px', height:'80px', borderRadius:'50%', border:'4px solid #1e293b', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', objectFit:'cover', background:'#fff'}} />
             <div style={{fontSize:'16px', fontWeight:900, textAlign:'center'}}>{teamB.name}</div>
          </div>
        </div>

        <div style={{fontSize:'48px', fontWeight:900, letterSpacing:'-1px', marginBottom:'64px'}}>0 - 0</div>

        <button 
          onClick={() => navigate('/kabaddi/create/toss')}
          style={{
            width:'100%', maxWidth:'320px', padding:'20px', borderRadius:'16px', background:'#ea580c', 
            color:'#fff', fontSize:'18px', fontWeight:900, border:'none', cursor:'pointer',
            boxShadow:'0 8px 24px rgba(234,88,12,0.3)', transition:'.2s'
          }}
        >
          Next: Toss →
        </button>
      </div>

    </div>
  )
}
