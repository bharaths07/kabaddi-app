import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings, Volume2 } from 'lucide-react'
import './KabaddiLiveScorer.css'

interface KabaddiScorerState {
  homeScore: number
  guestScore: number
  currentRaid: number
  timeElapsed: number
  isRunning: boolean
  currentRaider: 'home' | 'guest'
  bonusPointsHome: number
  bonusPointsGuest: number
  raidHistory: RaidEvent[]
}

interface RaidEvent {
  raidNumber: number
  raider: 'home' | 'guest'
  pointsScored: number
  timestamp: Date
  type: 'raid' | 'defense'
}

const KabaddiLiveScorer: React.FC = () => {
  const [state, setState] = useState<KabaddiScorerState>({
    homeScore: 45,
    guestScore: 30,
    currentRaid: 30,
    timeElapsed: 1185, // 19:45 in seconds
    isRunning: false,
    currentRaider: 'home',
    bonusPointsHome: 0,
    bonusPointsGuest: 0,
    raidHistory: [],
  })

  const [matchDuration] = useState(1200) // 20 minutes in seconds
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.isRunning && state.timeElapsed < matchDuration) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.isRunning, state.timeElapsed, matchDuration])

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Determine period
  const getPeriod = () => {
    if (state.timeElapsed < 600) return 'PERIOD 1'
    return 'PERIOD 2'
  }

  // Play sound
  const playSound = (type: 'success' | 'error' | 'undo') => {
    if (!soundEnabled) return
    // In production, use actual audio files
    console.log(`Playing sound: ${type}`)
  }

  // Add raid points
  const addPoints = (team: 'home' | 'guest', points: number) => {
    playSound('success')
    setState(prev => {
      const newRaidEvent: RaidEvent = {
        raidNumber: prev.currentRaid,
        raider: team,
        pointsScored: points,
        timestamp: new Date(),
        type: 'raid',
      }

      return {
        ...prev,
        [team === 'home' ? 'homeScore' : 'guestScore']: (team === 'home' ? prev.homeScore : prev.guestScore) + points,
        raidHistory: [...prev.raidHistory, newRaidEvent],
      }
    })
  }

  // Add tackle/defense points
  const addTackle = (team: 'home' | 'guest', points: number) => {
    playSound('success')
    setState(prev => {
      const newRaidEvent: RaidEvent = {
        raidNumber: prev.currentRaid,
        raider: team === 'home' ? 'guest' : 'home', // Opposite team is defending
        pointsScored: points,
        timestamp: new Date(),
        type: 'defense',
      }

      return {
        ...prev,
        [team === 'home' ? 'homeScore' : 'guestScore']: (team === 'home' ? prev.homeScore : prev.guestScore) + points,
        raidHistory: [...prev.raidHistory, newRaidEvent],
      }
    })
  }

  // Undo last action
  const undoLastAction = () => {
    playSound('undo')
    if (state.raidHistory.length === 0) return

    setState(prev => {
      const lastEvent = prev.raidHistory[prev.raidHistory.length - 1]
      const newRaidHistory = prev.raidHistory.slice(0, -1)

      return {
        ...prev,
        [lastEvent.raider === 'home' ? 'homeScore' : 'guestScore']:
          (lastEvent.raider === 'home' ? prev.homeScore : prev.guestScore) - lastEvent.pointsScored,
        raidHistory: newRaidHistory,
      }
    })
  }

  // Next raid
  const nextRaid = () => {
    setState(prev => ({
      ...prev,
      currentRaid: prev.currentRaid + 1,
      currentRaider: prev.currentRaider === 'home' ? 'guest' : 'home',
    }))
  }

  // Toggle play/pause
  const toggleTimer = () => {
    setState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
    }))
  }

  // Reset match
  const resetMatch = () => {
    if (window.confirm('Are you sure you want to reset the match?')) {
      setState({
        homeScore: 0,
        guestScore: 0,
        currentRaid: 1,
        timeElapsed: 0,
        isRunning: false,
        currentRaider: 'home',
        bonusPointsHome: 0,
        bonusPointsGuest: 0,
        raidHistory: [],
      })
    }
  }

  return (
    <div className="kabaddi-scorer">
      {/* Header Section */}
      <div className="scorer-header">
        <div className="period-display">{getPeriod()}</div>
        <div className="timer-display">{formatTime(state.timeElapsed)}</div>
        <div className="sound-toggle">
          <button
            className={`sound-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle sound"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>

      {/* Raid Counter */}
      <div className="raid-counter">
        <div className="raid-label">RAID</div>
        <div className="raid-number">{state.currentRaid}</div>
      </div>

      {/* Main Scoring Area */}
      <div className="scoring-container">
        {/* HOME TEAM */}
        <div className="team-section home-team">
          <div className="team-name">HOME</div>
          <div className="team-score">{state.homeScore}</div>

          {/* Bonus Line */}
          <div className="bonus-section">
            <div className="bonus-label">BONUS LINE</div>
            <div className="bonus-buttons">
              <button
                className="bonus-btn"
                onClick={() => addPoints('home', 0)}
              >
                +0
              </button>
              <div className="bonus-dots">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`bonus-dot ${state.bonusPointsHome > i ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Defense Section */}
          <div className="defense-section">
            <div className="defense-label">DEFENSE</div>
            <div className="defense-buttons">
              <button
                className="defense-btn btn-0"
                onClick={() => addTackle('home', 0)}
              >
                +0
              </button>
              <button
                className="defense-btn btn-1"
                onClick={() => addTackle('home', 1)}
              >
                +1
              </button>
              <button
                className="defense-btn btn-2"
                onClick={() => addTackle('home', 2)}
              >
                +2
              </button>
              <button
                className="defense-btn btn-3"
                onClick={() => addTackle('home', 3)}
              >
                +3
              </button>
            </div>
          </div>
        </div>

        {/* CENTER CONTROLS */}
        <div className="controls-section">
          {/* Raid/Attack Buttons */}
          <div className="raid-buttons">
            <button
              className="raid-btn raid-success"
              onClick={() => addPoints('home', 3)}
              title="Successful raid - 3 points"
            >
              RAID <br />
              <small>+3</small>
            </button>
            <button
              className="raid-btn raid-fail"
              onClick={() => {
                nextRaid()
                playSound('error')
              }}
              title="Failed raid - No points"
            >
              TACKLE <br />
              <small>FAIL</small>
            </button>
          </div>

          {/* Timer Controls */}
          <div className="timer-controls">
            <button
              className={`timer-btn ${state.isRunning ? 'pause' : 'play'}`}
              onClick={toggleTimer}
              title={state.isRunning ? 'Pause' : 'Play'}
            >
              {state.isRunning ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn undo-btn"
              onClick={undoLastAction}
              disabled={state.raidHistory.length === 0}
              title="Undo last action"
            >
              <RotateCcw size={20} />
              UNDO
            </button>
            <button
              className="action-btn settings-btn"
              onClick={() => console.log('Open settings')}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              className="action-btn reset-btn"
              onClick={resetMatch}
              title="Reset match"
            >
              RESET
            </button>
          </div>
        </div>

        {/* GUEST TEAM */}
        <div className="team-section guest-team">
          <div className="team-name">GUEST</div>
          <div className="team-score">{state.guestScore}</div>

          {/* Bonus Line */}
          <div className="bonus-section">
            <div className="bonus-label">BONUS LINE</div>
            <div className="bonus-buttons">
              <button
                className="bonus-btn"
                onClick={() => addPoints('guest', 0)}
              >
                +0
              </button>
              <div className="bonus-dots">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`bonus-dot ${state.bonusPointsGuest > i ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Defense Section */}
          <div className="defense-section">
            <div className="defense-label">DEFENSE</div>
            <div className="defense-buttons">
              <button
                className="defense-btn btn-0"
                onClick={() => addTackle('guest', 0)}
              >
                +0
              </button>
              <button
                className="defense-btn btn-1"
                onClick={() => addTackle('guest', 1)}
              >
                +1
              </button>
              <button
                className="defense-btn btn-2"
                onClick={() => addTackle('guest', 2)}
              >
                +2
              </button>
              <button
                className="defense-btn btn-3"
                onClick={() => addTackle('guest', 3)}
              >
                +3
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Last Raid Info */}
      <div className="last-raid-info">
        {state.raidHistory.length > 0 && (
          <div>
            Last: Raid #{state.raidHistory[state.raidHistory.length - 1].raidNumber} -
            {state.raidHistory[state.raidHistory.length - 1].raider === 'home' ? ' HOME' : ' GUEST'} +
            {state.raidHistory[state.raidHistory.length - 1].pointsScored}
          </div>
        )}
      </div>
    </div>
  )
}

export default KabaddiLiveScorer