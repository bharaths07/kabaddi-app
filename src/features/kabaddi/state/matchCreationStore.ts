// ── matchCreationStore.ts ─────────────────────────────────────────
// Manages the full "Start a Match" wizard state in localStorage
// No Supabase needed — works offline

export interface TeamData {
    id: string
    name: string
    short: string
    color: string
}

export interface PlayerData {
    id: string
    name: string
    role: 'raider' | 'defender' | 'all-rounder' | 'captain'
    number: number
    teamId: string
}

export interface MatchConfig {
    title: string
    type: 'standard' | 'quick' | 'tournament'
    halfDuration: number      // minutes
    breakDuration: number     // minutes
    raidTimer: number         // seconds
    allOutPoints: number      // usually 2
    bonusLineEnabled: boolean
    superTackleEnabled: boolean
    doOrDieEnabled: boolean
    goldenRaidEnabled: boolean
}

export interface LineupData {
    teamAStarters: string[]   // player IDs
    teamASubs: string[]
    teamBStarters: string[]
    teamBSubs: string[]
}

export interface TossData {
    calledBy: 'A' | 'B'
    calledChoice: 'heads' | 'tails'
    result: 'heads' | 'tails'
    winner: 'A' | 'B'
    decision: 'raid_first' | 'court_side'
    raidingFirst: 'A' | 'B'
}

export interface MatchCreationState {
    matchId: string
    teamA: TeamData | null
    teamB: TeamData | null
    config: MatchConfig
    lineup: LineupData
    toss: TossData | null
    status: 'setup' | 'teams' | 'lineup' | 'toss' | 'live' | 'completed'
    createdAt: string
}

const KEY = 'pl.match.creation'

const DEFAULT_CONFIG: MatchConfig = {
    title: '',
    type: 'standard',
    halfDuration: 20,
    breakDuration: 5,
    raidTimer: 30,
    allOutPoints: 2,
    bonusLineEnabled: true,
    superTackleEnabled: true,
    doOrDieEnabled: true,
    goldenRaidEnabled: false,
}

const DEFAULT_LINEUP: LineupData = {
    teamAStarters: [],
    teamASubs: [],
    teamBStarters: [],
    teamBSubs: [],
}

function newMatchId() {
    return `match-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getCreationState(): MatchCreationState | null {
    try {
        const raw = localStorage.getItem(KEY)
        return raw ? JSON.parse(raw) : null
    } catch { return null }
}

export function startNewMatch(): MatchCreationState {
    const state: MatchCreationState = {
        matchId: newMatchId(),
        teamA: null,
        teamB: null,
        config: { ...DEFAULT_CONFIG },
        lineup: { ...DEFAULT_LINEUP },
        toss: null,
        status: 'setup',
        createdAt: new Date().toISOString(),
    }
    save(state)
    return state
}

export function saveTeams(teamA: TeamData, teamB: TeamData) {
    const s = getCreationState() || startNewMatch()
    s.teamA = teamA
    s.teamB = teamB
    s.status = 'teams'
    save(s)
}

export function saveConfig(config: MatchConfig) {
    const s = getCreationState() || startNewMatch()
    s.config = config
    s.status = 'lineup'
    save(s)
}

export function saveLineup(lineup: LineupData) {
    const s = getCreationState() || startNewMatch()
    s.lineup = lineup
    s.status = 'toss'
    save(s)
}

export function saveToss(toss: TossData) {
    const s = getCreationState() || startNewMatch()
    s.toss = toss
    s.status = 'live'
    save(s)
}

export function setMatchLive() {
    const s = getCreationState()
    if (s) { s.status = 'live'; save(s) }
}

export function clearCreation() {
    try { localStorage.removeItem(KEY) } catch { }
}

function save(s: MatchCreationState) {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { }
}

// ── Team & Player helpers (localStorage based) ────────────────────
const TEAMS_KEY = 'pl.teams'
const PLAYERS_KEY = 'pl.players'

export function getStoredTeams(): TeamData[] {
    try {
        const raw = localStorage.getItem(TEAMS_KEY)
        return raw ? JSON.parse(raw) : getDefaultTeams()
    } catch { return getDefaultTeams() }
}

export function saveTeamToStore(team: TeamData) {
    const teams = getStoredTeams()
    const idx = teams.findIndex(t => t.id === team.id)
    if (idx >= 0) teams[idx] = team
    else teams.push(team)
    try { localStorage.setItem(TEAMS_KEY, JSON.stringify(teams)) } catch { }
}

export function getStoredPlayers(teamId: string): PlayerData[] {
    try {
        const raw = localStorage.getItem(PLAYERS_KEY)
        const all: PlayerData[] = raw ? JSON.parse(raw) : []
        return all.filter(p => p.teamId === teamId)
    } catch { return [] }
}

export function savePlayerToStore(player: PlayerData) {
    try {
        const raw = localStorage.getItem(PLAYERS_KEY)
        const all: PlayerData[] = raw ? JSON.parse(raw) : []
        const idx = all.findIndex(p => p.id === player.id)
        if (idx >= 0) all[idx] = player
        else all.push(player)
        localStorage.setItem(PLAYERS_KEY, JSON.stringify(all))
    } catch { }
}

// Default teams so app works immediately
function getDefaultTeams(): TeamData[] {
    return [
        { id: 't1', name: 'SKBC Varadanayakanahalli', short: 'SKBC', color: '#0ea5e9' },
        { id: 't2', name: 'CSE B Rangers', short: 'CBR', color: '#7c3aed' },
        { id: 't3', name: 'Warriors FC', short: 'WFC', color: '#16a34a' },
        { id: 't4', name: 'Titans Kabaddi', short: 'TKC', color: '#ea580c' },
        { id: 't5', name: 'Spartans United', short: 'SU', color: '#db2777' },
        { id: 't6', name: 'Falcons KC', short: 'FKC', color: '#0284c7' },
    ]
}

// Default players per team
export function getDefaultPlayers(teamId: string, teamName: string): PlayerData[] {
    const roles: PlayerData['role'][] = ['raider', 'raider', 'raider', 'defender', 'defender', 'defender', 'all-rounder', 'all-rounder', 'all-rounder', 'captain', 'raider', 'defender']
    return Array.from({ length: 12 }, (_, i) => ({
        id: `${teamId}-p${i + 1}`,
        name: `Player ${i + 1}`,
        role: roles[i] || 'raider',
        number: i + 1,
        teamId,
    }))
}