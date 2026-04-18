import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKabaddiStore } from '../../../stores/useKabaddiStore'
import { useAuth } from '../../../shared/context/AuthContext'
import { supabase } from '../../../shared/lib/supabase'
import { ArrowLeft, Loader2, CheckCircle, Share2, Download, Trophy } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import { exportNodePNG } from '../components/posters'
import type { Team } from '../../../data/teams'
import type { Player } from '../../../data/players'
import '../components/profile/profile.css'

export default function PlayerPublicPage() {
  const { teamSlug, playerSlug } = useParams()
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)

  const { fetchPlayerBySlug, fetchTeamBySlug, setActivePlayerSlug, setActiveTeamSlug, claimPlayer } = useKabaddiStore()
  const { user } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)
  const [matchStats, setMatchStats] = useState<any[]>([])

  useEffect(() => {
    if (!playerSlug || !teamSlug) return
    (async () => {
      setLoading(true)
      setActiveTeamSlug(teamSlug)
      setActivePlayerSlug(playerSlug)

      const p = await fetchPlayerBySlug(playerSlug)
      const t = await fetchTeamBySlug(teamSlug)

      setPlayer(p)
      setTeam(t)
      if (p?.is_claimed) setIsClaimed(true)

      // Fetch Match History
      if (p) {
        const { data: stats } = await supabase
          .from('player_match_stats')
          .select(`
            *,
            fixtures (
              id, ts, status,
              home: teams!team_home_id (name, slug),
              guest: teams!team_guest_id (name, slug)
            )
          `)
          .eq('player_id', p.id)
          .order('created_at', { ascending: false })
        
        if (stats) setMatchStats(stats)
      }

      setLoading(false)
    })()

    return () => {
      setActiveTeamSlug(null)
      setActivePlayerSlug(null)
    }
  }, [playerSlug, teamSlug, fetchPlayerBySlug, fetchTeamBySlug, setActivePlayerSlug, setActiveTeamSlug])

  const handleClaim = async () => {
    if (!playerSlug || !user) return
    setClaiming(true)
    const success = await claimPlayer(playerSlug, user.id)
    if (success) {
      setIsClaimed(true)
      // Show local feedback
      alert(`Congratulations! You have successfully claimed ${player?.name}'s profile.`)
    } else {
      alert('Claiming failed. Please ensure you are logged in and this profile is not already claimed.')
    }
    setClaiming(false)
  }

  const handleDownloadCard = async () => {
    if (!cardRef.current || !player) return
    await exportNodePNG(cardRef.current, `${player.slug}-card.png`)
  }

  const handleShareWhatsApp = async () => {
    if (!player) return
    const text = `Check out ${player.name}'s pro profile on KabaddiPulse! 🔥`
    const url = window.location.href
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`)
  }

  if (loading) {
    return (
      <div className="pro-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
        <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
      </div>
    )
  }

  if (!player || !team) {
    return (
      <div className="pro-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)', color: 'var(--text-muted)' }}>
        <h2 style={{ marginBottom: 16 }}>Player Not Found</h2>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    )
  }

  // Aggregated Stats Calculations
  const totalMatches = matchStats.length
  const totalRaidPts = matchStats.reduce((sum, s) => sum + (s.raid_pts || 0), 0)
  const totalTacklePts = matchStats.reduce((sum, s) => sum + (s.tackle_pts || 0), 0)
  const totalPoints = totalRaidPts + totalTacklePts
  const avgPoints = totalMatches > 0 ? (totalPoints / totalMatches).toFixed(1) : '0.0'

  // Format Recharts data
  const radarData = [
    { subject: 'Speed', A: player.attributes.speed, fullMark: 100 },
    { subject: 'Strength', A: player.attributes.strength, fullMark: 100 },
    { subject: 'Tactics', A: player.attributes.tactics, fullMark: 100 },
    { subject: 'Agility', A: player.attributes.agility, fullMark: 100 },
    { subject: 'Defense', A: player.attributes.defense, fullMark: 100 },
  ]

  return (
    <div className="pro-page" style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: '80px' }}>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Nav Bar */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate(`/${teamSlug}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)',
              color: 'var(--text-primary)', border: '1px solid var(--bg-border)', padding: '10px 20px',
              borderRadius: '99px', cursor: 'pointer', fontSize: 13, fontWeight: 800,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <ArrowLeft size={16} /> Franchise Hub
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownloadCard}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)',
                color: 'var(--text-primary)', border: '1px solid var(--bg-border)', padding: '10px 20px',
                borderRadius: '99px', cursor: 'pointer', fontSize: 13, fontWeight: 800,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Download size={16} /> Save Card
            </button>
            <button
              onClick={handleShareWhatsApp}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: '#25D366',
                color: '#fff', border: 'none', padding: '10px 20px',
                borderRadius: '99px', cursor: 'pointer', fontSize: 13, fontWeight: 800,
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
              }}
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        <div className="pro-fifa-grid">

          {/* Left Col: Ultimate Team Card */}
          <div>
            <div ref={cardRef} style={{
              width: '100%', aspectRatio: '2/3', background: `linear-gradient(145deg, #0f172a, ${team.primaryColor})`,
              borderRadius: '24px', position: 'relative', overflow: 'hidden', padding: '24px',
              boxShadow: `0 20px 40px ${team.primaryColor}55`, border: '2px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 2 }}>
                <div style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#fff', lineHeight: 0.9 }}>
                  {player.powerScore}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginTop: '4px' }}>
                  {player.role.substring(0, 3)}
                </div>
                <img src={team.logo} alt="team" style={{ width: 40, height: 40, marginTop: 12 }} />
                <div style={{ fontSize: '18px', fontWeight: 900, marginTop: 12 }}>{player.nationality}</div>
              </div>

              {/* Action Photo Placeholder (Usually transparent PNG, simulated here) */}
              <div style={{ position: 'absolute', bottom: 0, right: -40, zIndex: 1 }}>
                <img src={player.avatar} alt="action" style={{ width: 350, opacity: 0.6, mixBlendMode: 'luminosity' }} />
              </div>

              <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2, borderTop: '2px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
                <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {player.name}
                  {isClaimed && <CheckCircle size={24} fill="#34d399" color="#fff" />}
                </h1>
                {isClaimed && (
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 900, color: '#fff', 
                    background: 'rgba(52, 211, 153, 0.25)', border: '1px solid rgba(52, 211, 153, 0.4)',
                    padding: '4px 10px', borderRadius: '4px', marginTop: 8,
                    letterSpacing: '1px'
                  }}>
                    VERIFIED ATHLETE
                  </div>
                )}
              </div>
            </div>

            {!isClaimed ? (
              <button
                onClick={handleClaim}
                disabled={claiming || !user}
                style={{
                  width: '100%', marginTop: '24px', background: 'var(--color-primary)',
                  color: '#fff', padding: '16px', borderRadius: '16px', border: 'none',
                  fontWeight: 900, fontSize: '16px', cursor: (claiming || !user) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(253,107,53,0.3)',
                  opacity: (claiming || !user) ? 0.7 : 1
                }}
              >
                {claiming ? 'Verifying...' : user ? 'Is this you? Claim Profile' : 'Login to Claim Profile'}
              </button>
            ) : (
              <div style={{
                width: '100%', marginTop: '24px', background: 'rgba(52, 211, 153, 0.1)',
                color: '#34d399', padding: '16px', borderRadius: '16px', border: '1px solid rgba(52, 211, 153, 0.2)',
                fontWeight: 900, fontSize: '15px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <CheckCircle size={18} /> Verified Account
              </div>
            )}
          </div>


          {/* Right Col: Radar + Career */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Visual Stats Row */}
            <div className="pro-radar-row">

              {/* Radar Chart Panel */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>Skill Matrix</h3>
                <div style={{ width: '100%', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="var(--bg-border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Attributes" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Stats Panel */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Raids</div>
                  <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-navy)' }}>{player.stats.raids}</div>
                </div>
                <div style={{ height: '1px', background: 'var(--bg-border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Tackle Points</div>
                  <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-navy)' }}>{player.stats.tackles}</div>
                </div>
                <div style={{ height: '1px', background: 'var(--bg-border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Super Raids</div>
                  <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-primary)' }}>{player.stats.superRaids}</div>
                </div>
              </div>

            </div>

            {/* Season Performance Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Matches</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>{totalMatches || '—'}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Pts</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-primary)', marginTop: '8px' }}>{totalPoints || '—'}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg / Match</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '8px' }}>{avgPoints || '—'}</div>
              </div>
            </div>

            {/* Match History Row */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>Recent Performance</h3>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Last 5 Matches</div>
              </div>

              {matchStats.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '40px 0' }}>
                  No official matches recorded for this season yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matchStats.slice(0, 5).map((m: any) => {
                    const f = m.fixtures
                    const opponent = f.home.name === team.name ? f.guest.name : f.home.name
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bg-border)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>vs {opponent}</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {f.ts ? new Date(f.ts).toLocaleDateString() : 'TBD'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>{m.raid_pts + m.tackle_pts} Pts</div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>R: {m.raid_pts} | T: {m.tackle_pts}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Career Timeline */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>Career History</h3>
                <Trophy size={20} color="var(--color-primary)" />
              </div>
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Vertical line connecting timeline nodes */}
                <div style={{ position: 'absolute', left: 0, top: 12, bottom: 20, width: '2px', background: 'var(--bg-border)' }} />

                {player.careerHistory.map((ch: any, idx: number) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: '24px' }}>
                    {/* Node dot */}
                    <div style={{
                      position: 'absolute', left: '-29px', top: '4px', width: '12px', height: '12px',
                      borderRadius: '50%', background: idx === 0 ? 'var(--color-primary)' : 'var(--text-muted)',
                      border: '2px solid var(--bg-surface)'
                    }} />

                    <div style={{ fontSize: '12px', fontWeight: 800, color: idx === 0 ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                      {ch.season}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {ch.team}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {ch.points} Total Points
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
