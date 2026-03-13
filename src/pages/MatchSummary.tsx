import React, { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import '../features/kabaddi/components/matches/match-details.css'

export default function MatchSummary() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock data for the summary - in a real app, this would come from a service/store
  const match = useMemo(() => ({
    id: id || 'm1',
    tournament: 'KPL 2026',
    stage: 'Final',
    venue: 'Indoor Stadium, Vizag',
    teams: {
      a: { name: 'Telugu Titans', short: 'TT', score: 35, color: '#ef4444' },
      b: { name: 'Tamil Thalaivas', short: 'THT', score: 38, color: '#0ea5e9' }
    },
    result: 'Tamil Thalaivas beat Telugu Titans (38-35)',
    stats: {
      raidPoints: { a: 22, b: 25 },
      tacklePoints: { a: 8, b: 9 },
      allOutPoints: { a: 4, b: 4 },
      extraPoints: { a: 1, b: 0 }
    },
    topPerformers: [
      { name: 'Arjun Deshwal', team: 'THT', role: 'Raider', raidPts: 12, tacklePts: 0, super10: true },
      { name: 'Pawan Sehrawat', team: 'TT', role: 'Raider', raidPts: 9, tacklePts: 1, super10: false },
      { name: 'Sagar', team: 'THT', role: 'Defender', raidPts: 0, tacklePts: 5, high5: true },
    ]
  }), [id])

  return (
    <div className="md-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header / Hero */}
      <div className="md-hero" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)', padding: '40px 20px', borderRadius: 0 }}>
        <div className="md-topmeta" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
          {match.tournament} • {match.stage} • {match.venue}
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 20, width: 'fit-content', margin: '16px auto', fontSize: 12, fontWeight: 900, color: '#fbbf24' }}>
          MATCH COMPLETED
        </div>

        <div className="md-row" style={{ marginTop: 20 }}>
          <div className="md-team">
            <div className="md-avatar" style={{ background: match.teams.a.color, width: 80, height: 80, fontSize: 28 }}>{match.teams.a.short}</div>
            <div className="md-name" style={{ color: '#fff', fontSize: 20, marginTop: 12 }}>{match.teams.a.name}</div>
          </div>
          
          <div className="md-score">
            <div className="md-scoreline" style={{ color: '#fff', fontSize: 52, letterSpacing: -2 }}>
              {match.teams.a.score} <span className="md-sep" style={{ opacity: 0.3 }}>-</span> {match.teams.b.score}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: 14, marginTop: 10 }}>
              {match.result}
            </div>
          </div>

          <div className="md-team right">
            <div className="md-avatar" style={{ background: match.teams.b.color, width: 80, height: 80, fontSize: 28 }}>{match.teams.b.short}</div>
            <div className="md-name" style={{ color: '#fff', fontSize: 20, marginTop: 12 }}>{match.teams.b.name}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Score Breakdown */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 900, color: '#1e293b', borderLeft: '4px solid #f97316', paddingLeft: 12 }}>Score Breakdown</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Raid Points', valA: match.stats.raidPoints.a, valB: match.stats.raidPoints.b },
              { label: 'Tackle Points', valA: match.stats.tacklePoints.a, valB: match.stats.tacklePoints.b },
              { label: 'All Out Points', valA: match.stats.allOutPoints.a, valB: match.stats.allOutPoints.b },
              { label: 'Extra Points', valA: match.stats.extraPoints.a, valB: match.stats.extraPoints.b },
            ].map((row, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, textAlign: 'right', fontWeight: 900, fontSize: 18, color: match.teams.a.color }}>{row.valA}</div>
                <div style={{ flex: 2, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{row.label}</div>
                <div style={{ flex: 1, textAlign: 'left', fontWeight: 900, fontSize: 18, color: match.teams.b.color }}>{row.valB}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 900, color: '#1e293b', borderLeft: '4px solid #f97316', paddingLeft: 12 }}>Top Performers</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {match.topPerformers.map((p, idx) => (
              <Link to={`/players/${p.name.toLowerCase().replace(/\s+/g, '-')}`} key={idx} className="md-lineup-card" style={{ padding: 16 }}>
                <div className="md-lineup-avatar">
                  <div className="md-pavatar sm" style={{ background: p.team === 'TT' ? match.teams.a.color : match.teams.b.color, color: '#fff' }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="md-lineup-info">
                  <div className="md-lineup-name" style={{ fontSize: 16 }}>{p.name}</div>
                  <div className="md-lineup-role">{p.role} • {p.team === 'TT' ? match.teams.a.name : match.teams.b.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: '#1e293b' }}>{p.raidPts + p.tacklePts}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8' }}>TOTAL PTS</div>
                </div>
                {(p.super10 || p.high5) && (
                  <div style={{ marginLeft: 12, background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900 }}>
                    {p.super10 ? 'SUPER 10' : 'HIGH 5'}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button 
            onClick={() => navigate(`/matches/${match.id}`)}
            style={{ flex: 1, height: 52, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
          >
            Detailed Scorecard
          </button>
          <button 
            style={{ flex: 1, height: 52, borderRadius: 16, border: 'none', background: '#f97316', color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' }}
          >
            Share Summary
          </button>
        </div>

        <button 
          onClick={() => navigate('/')}
          style={{ height: 52, borderRadius: 16, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  )
}
