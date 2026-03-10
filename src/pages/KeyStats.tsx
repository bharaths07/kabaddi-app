import { useState } from 'react'
import './KeyStats.css'

const STAT_CATEGORIES = [
  { key: 'topRaiders', label: 'Top Raiders', icon: '⚡', color: '#f59e0b', prize: '₹5,000' },
  { key: 'topDefenders', label: 'Top Defenders', icon: '🛡️', color: '#0ea5e9', prize: '₹5,000' },
  { key: 'superRaids', label: 'Super Raids', icon: '🔥', color: '#ef4444', prize: '₹2,000' },
  { key: 'superTackles', label: 'Super Tackles', icon: '💥', color: '#8b5cf6', prize: '₹2,000' },
  { key: 'mostAllOuts', label: 'Most All Outs', icon: '☠️', color: '#10b981', prize: '₹1,000' },
  { key: 'bonusPoints', label: 'Bonus Points', icon: '🎯', color: '#06b6d4', prize: '₹1,000' },
]

const STATS: Record<string, any[]> = {
  topRaiders: [
    { rank: 1, name: 'Ashu Malik', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 5, raids: 72, successRaids: 52, superRaids: 12, bonuspts: 8, pts: 82, raidPct: '72.2%' },
    { rank: 2, name: 'Bharath Gowda', team: 'SKBC', abbr: 'SK', color: '#0ea5e9', matches: 5, raids: 68, successRaids: 48, superRaids: 9, bonuspts: 6, pts: 74, raidPct: '70.6%' },
    { rank: 3, name: 'Dev Singh', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, raids: 60, successRaids: 44, superRaids: 7, bonuspts: 5, pts: 64, raidPct: '73.3%' },
    { rank: 4, name: 'Maninder Singh', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 5, raids: 65, successRaids: 42, superRaids: 6, bonuspts: 4, pts: 58, raidPct: '64.6%' },
    { rank: 5, name: 'Pradeep Kumar', team: 'Lions', abbr: 'LN', color: '#f43f5e', matches: 4, raids: 55, successRaids: 36, superRaids: 5, bonuspts: 3, pts: 50, raidPct: '65.5%' },
    { rank: 6, name: 'Rahul Chaudhari', team: 'Panthers', abbr: 'PH', color: '#06b6d4', matches: 5, raids: 62, successRaids: 38, superRaids: 4, bonuspts: 2, pts: 46, raidPct: '61.3%' },
    { rank: 7, name: 'Surender Nada', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 3, raids: 40, successRaids: 26, superRaids: 3, bonuspts: 2, pts: 36, raidPct: '65.0%' },
    { rank: 8, name: 'Ajay Thakur', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 4, raids: 44, successRaids: 28, superRaids: 2, bonuspts: 1, pts: 32, raidPct: '63.6%' },
    { rank: 9, name: 'Nitin Tomar', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 3, raids: 36, successRaids: 22, superRaids: 2, bonuspts: 1, pts: 28, raidPct: '61.1%' },
    { rank: 10, name: 'Vikash Kandola', team: 'Lions', abbr: 'LN', color: '#f43f5e', matches: 4, raids: 42, successRaids: 24, superRaids: 1, bonuspts: 0, pts: 26, raidPct: '57.1%' },
  ],
  topDefenders: [
    { rank: 1, name: 'Fazel Atrachali', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 5, tackles: 28, successTackles: 22, superTackles: 8, dashes: 6, pts: 36, tacklePct: '78.6%' },
    { rank: 2, name: 'Ravi Kumar', team: 'SKBC', abbr: 'SK', color: '#0ea5e9', matches: 5, tackles: 26, successTackles: 20, superTackles: 6, dashes: 5, pts: 32, tacklePct: '76.9%' },
    { rank: 3, name: 'Sandeep Narwal', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, tackles: 24, successTackles: 18, superTackles: 5, dashes: 4, pts: 28, tacklePct: '75.0%' },
    { rank: 4, name: 'Surjeet Singh', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 5, tackles: 22, successTackles: 16, superTackles: 4, dashes: 3, pts: 24, tacklePct: '72.7%' },
    { rank: 5, name: 'Vishal Mane', team: 'Lions', abbr: 'LN', color: '#f43f5e', matches: 4, tackles: 20, successTackles: 14, superTackles: 3, dashes: 2, pts: 20, tacklePct: '70.0%' },
    { rank: 6, name: 'Deepak Hooda', team: 'Panthers', abbr: 'PH', color: '#06b6d4', matches: 5, tackles: 18, successTackles: 12, superTackles: 2, dashes: 2, pts: 16, tacklePct: '66.7%' },
    { rank: 7, name: 'Mohit Chhillar', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 3, tackles: 14, successTackles: 10, superTackles: 2, dashes: 1, pts: 14, tacklePct: '71.4%' },
    { rank: 8, name: 'Parvesh Bhainswal', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, tackles: 16, successTackles: 10, superTackles: 1, dashes: 1, pts: 12, tacklePct: '62.5%' },
  ],
  superRaids: [
    { rank: 1, name: 'Ashu Malik', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 5, superRaids: 12, pts: 36 },
    { rank: 2, name: 'Bharath Gowda', team: 'SKBC', abbr: 'SK', color: '#0ea5e9', matches: 5, superRaids: 9, pts: 27 },
    { rank: 3, name: 'Dev Singh', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, superRaids: 7, pts: 21 },
    { rank: 4, name: 'Maninder Singh', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 5, superRaids: 6, pts: 18 },
    { rank: 5, name: 'Pradeep Kumar', team: 'Lions', abbr: 'LN', color: '#f43f5e', matches: 4, superRaids: 5, pts: 15 },
  ],
  superTackles: [
    { rank: 1, name: 'Fazel Atrachali', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 5, superTackles: 8, pts: 24 },
    { rank: 2, name: 'Ravi Kumar', team: 'SKBC', abbr: 'SK', color: '#0ea5e9', matches: 5, superTackles: 6, pts: 18 },
    { rank: 3, name: 'Sandeep Narwal', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, superTackles: 5, pts: 15 },
    { rank: 4, name: 'Surjeet Singh', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 5, superTackles: 4, pts: 12 },
    { rank: 5, name: 'Vishal Mane', team: 'Lions', abbr: 'LN', color: '#f43f5e', matches: 4, superTackles: 3, pts: 9 },
  ],
  mostAllOuts: [
    { rank: 1, name: 'SKBC', team: 'SKBC', abbr: 'SK', color: '#0ea5e9', matches: 5, allOuts: 8, pts: 40 },
    { rank: 2, name: 'Rangers', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 5, allOuts: 7, pts: 35 },
    { rank: 3, name: 'Titans', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, allOuts: 6, pts: 30 },
    { rank: 4, name: 'Warriors', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 5, allOuts: 5, pts: 25 },
    { rank: 5, name: 'Lions', team: 'Lions', abbr: 'LN', color: '#f43f5e', matches: 4, allOuts: 3, pts: 15 },
  ],
  bonusPoints: [
    { rank: 1, name: 'Ashu Malik', team: 'Rangers', abbr: 'RG', color: '#f59e0b', matches: 5, bonus: 8, pts: 8 },
    { rank: 2, name: 'Bharath Gowda', team: 'SKBC', abbr: 'SK', color: '#0ea5e9', matches: 5, bonus: 6, pts: 6 },
    { rank: 3, name: 'Dev Singh', team: 'Titans', abbr: 'TT', color: '#8b5cf6', matches: 4, bonus: 5, pts: 5 },
    { rank: 4, name: 'Maninder Singh', team: 'Warriors', abbr: 'WR', color: '#10b981', matches: 5, bonus: 4, pts: 4 },
    { rank: 5, name: 'Rahul Chaudhari', team: 'Panthers', abbr: 'PH', color: '#06b6d4', matches: 5, bonus: 2, pts: 2 },
  ],
}

const TABLE_COLS: Record<string, Array<{ key: string; label: string; highlight?: boolean }>> = {
  topRaiders: [
    { key: 'matches', label: 'Mat' },
    { key: 'raids', label: 'Raids' },
    { key: 'successRaids', label: 'Succ' },
    { key: 'superRaids', label: 'SR' },
    { key: 'raidPct', label: 'Raid%' },
    { key: 'pts', label: 'Pts', highlight: true },
  ],
  topDefenders: [
    { key: 'matches', label: 'Mat' },
    { key: 'tackles', label: 'Tckl' },
    { key: 'successTackles', label: 'Succ' },
    { key: 'superTackles', label: 'ST' },
    { key: 'tacklePct', label: 'Tckl%' },
    { key: 'pts', label: 'Pts', highlight: true },
  ],
  superRaids: [
    { key: 'matches', label: 'Mat' },
    { key: 'superRaids', label: 'Super Raids', highlight: true },
    { key: 'pts', label: 'Pts' },
  ],
  superTackles: [
    { key: 'matches', label: 'Mat' },
    { key: 'superTackles', label: 'Super Tackles', highlight: true },
    { key: 'pts', label: 'Pts' },
  ],
  mostAllOuts: [
    { key: 'matches', label: 'Mat' },
    { key: 'allOuts', label: 'All Outs', highlight: true },
    { key: 'pts', label: 'Pts' },
  ],
  bonusPoints: [
    { key: 'matches', label: 'Mat' },
    { key: 'bonus', label: 'Bonus', highlight: true },
    { key: 'pts', label: 'Pts' },
  ],
}

function TeamBadge({ abbr, color, size = 32 }: { abbr: string; color: string; size?: number }) {
  return (
    <div className="ks-team-badge" style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      fontSize: size * 0.36,
      boxShadow: `0 2px 8px ${color}44`
    }}>{abbr}</div>
  )
}

function PlayerAvatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="ks-player-avatar" style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
      fontSize: size * 0.32,
      boxShadow: `0 3px 12px ${color}55`
    }}>{initials}</div>
  )
}

function PodiumHero({ data, category, color }: { data: any[]; category: any; color: string }) {
  const top3 = data.slice(0, 3)
  const order = [1, 0, 2]
  const heights = [80, 110, 65]
  const sizes = [52, 68, 48]
  return (
    <div className="ks-podium-container" style={{
      background: `linear-gradient(145deg, #0c1832 0%, #0f2d5e 50%, ${color}33 100%)`
    }}>
      <div className="ks-podium-grid" />
      <div className="ks-podium-glow" style={{ background: `radial-gradient(circle, ${color}44 0%, transparent 70%)` }} />
      <div className="ks-podium-header">
        <div className="ks-podium-meta">KPL 2026 • LEADERBOARD</div>
        <div className="ks-podium-title">{category.icon} {category.label}</div>
        <div className="ks-podium-prize">
          <span className="ks-podium-prize-text">🏆 Prize: {category.prize}</span>
        </div>
      </div>
      <div className="ks-podium-row">
        {order.map((idx, pos) => {
          const player = top3[idx]
          if (!player) return <div key={pos} style={{ flex: 1 }} />
          const isFirst = idx === 0
          return (
            <div key={pos} className="ks-podium-spot">
              {isFirst && (<div className="ks-podium-crown">👑</div>)}
              <div className="ks-podium-avatar">
                <PlayerAvatar name={player.name} color={player.color} size={sizes[pos]} />
              </div>
              <div className="ks-podium-name" style={{ fontSize: isFirst ? 13 : 11 }}>
                {player.name.split(' ')[0]}
              </div>
              <div className="ks-podium-pts" style={{ color: color, fontSize: isFirst ? 20 : 16 }}>
                {player.pts}
              </div>
              <div className="ks-podium-unit">pts</div>
              <div className="ks-podium-base" style={{
                height: heights[pos],
                background: isFirst
                  ? `linear-gradient(180deg, ${color}cc, ${color}55)`
                  : `linear-gradient(180deg, ${color}66, ${color}22)`,
                border: `1px solid ${color}44`,
                borderBottom: 'none'
              }}>
                <span className="ks-podium-rank" style={{
                  background: isFirst ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                  color: isFirst ? '#0c1832' : '#fff'
                }}>{player.rank}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatsTable({ data, cols, color, showMore, onToggle }:
  { data: any[]; cols: Array<{ key: string; label: string; highlight?: boolean }>; color: string; showMore: boolean; onToggle: () => void }) {
  const visible = showMore ? data : data.slice(0, 5)
  return (
    <div className="ks-table-container">
      <div className="ks-table-head">
        <div className="ks-table-head-rank">No.</div>
        <div className="ks-table-head-player">Player / Team</div>
        {cols.map(c => (
          <div key={c.key} className="ks-table-head-cell" style={{ color: c.highlight ? color : '#94a3b8' }}>{c.label}</div>
        ))}
      </div>
      {visible.map((player, i) => (
        <div key={i} className="ks-table-row" style={{ background: player.rank <= 3 ? `${player.color}08` : '#fff' }}>
          <div className="ks-table-rank-cell">
            {player.rank <= 3 ? (
              <span className="ks-table-rank-icon">{['🥇', '🥈', '🥉'][player.rank - 1]}</span>
            ) : (
              <span className="ks-table-rank-num">{player.rank}</span>
            )}
          </div>
          <div className="ks-table-player-cell">
            <PlayerAvatar name={player.name} color={player.color} size={36} />
            <div className="ks-table-player-info">
              <div className="ks-table-player-name">{player.name}</div>
              <div className="ks-table-player-meta">
                <TeamBadge abbr={player.abbr} color={player.color} size={16} />
                <span className="ks-table-player-team">{player.team}</span>
              </div>
            </div>
          </div>
          {cols.map(c => (
            <div key={c.key} className="ks-table-cell" style={{
              fontWeight: c.highlight ? 900 : 700,
              fontSize: c.highlight ? 15 : 13,
              color: c.highlight ? color : '#475569'
            }}>
              {player[c.key] ?? '-'}
            </div>
          ))}
        </div>
      ))}
      {data.length > 5 && (
        <button className="ks-load-more" type="button" onClick={onToggle} style={{ color }}>
          {showMore ? 'Show Less ↑' : `Load More (${data.length - 5} more) ↓`}
        </button>
      )}
    </div>
  )
}

export default function KeyStats() {
  const [activeCategory, setActiveCategory] = useState('topRaiders')
  const [showMore, setShowMore] = useState(false)
  const category = STAT_CATEGORIES.find(c => c.key === activeCategory) as any
  const data = STATS[activeCategory] || []
  const cols = TABLE_COLS[activeCategory] || []
  const handleCategoryChange = (key: string) => {
    setActiveCategory(key)
    setShowMore(false)
  }
  return (
    <div className="ks-page">
      <div className="ks-header">
        <a href="/leaderboards" className="ks-back-btn">←</a>
        <div className="ks-header-text">
          <div className="ks-header-sub">KPL 2026</div>
          <div className="ks-header-title">Key Stats & Rankings</div>
        </div>
        <div className="ks-prize-badge">Prize Based</div>
      </div>
      <div className="ks-nav-container">
        <div className="ks-nav-scroll">
          {STAT_CATEGORIES.map(c => (
            <button key={c.key} type="button" onClick={() => handleCategoryChange(c.key)} className="ks-nav-btn" style={{
              background: activeCategory === c.key ? `${c.color}22` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${activeCategory === c.key ? c.color : 'rgba(255,255,255,0.15)'}`,
              color: activeCategory === c.key ? '#fff' : 'rgba(255,255,255,0.8)'
            }}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="ks-main-content">
        <PodiumHero data={data} category={category} color={category.color} />
        <StatsTable data={data} cols={cols} color={category.color} showMore={showMore} onToggle={() => setShowMore(!showMore)} />
      </div>
    </div>
  )
}

