import React from 'react'
import { Link } from 'react-router-dom'
import './player-card.css'

interface PlayerCardProps {
  player: {
    id: string
    name: string
    photo?: string
    role: string
    teamName: string
    stats: {
      successfulRaids: number
      tackles: number
      super10s: number
    }
  }
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link to={`/player/${player.id}`} className="player-card premium-card">
      <div className="player-card-photo-container">
        {player.photo ? (
          <img src={player.photo} alt={player.name} className="player-photo" />
        ) : (
          <div className="player-photo-placeholder">
            <span>{player.name.charAt(0)}</span>
          </div>
        )}
        <div className="player-card-gradient" />
      </div>
      
      <div className="player-card-content">
        <div className="player-card-info">
          <h3 className="player-name">{player.name}</h3>
          <p className="player-team">{player.teamName} • {player.role}</p>
        </div>
        
        <div className="player-card-stats-grid">
          <div className="p-stat">
            <div className="p-stat-val">{player.stats.successfulRaids}</div>
            <div className="p-stat-label">Successful Raids</div>
          </div>
          <div className="p-stat">
            <div className="p-stat-val">{player.stats.tackles}</div>
            <div className="p-stat-label">Tackles</div>
          </div>
          <div className="p-stat">
            <div className="p-stat-val">{player.stats.super10s}</div>
            <div className="p-stat-label">Super 10s</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
