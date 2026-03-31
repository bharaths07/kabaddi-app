// tournamentStore.ts — manages full tournament state in localStorage
import { syncFullTournament } from '../../../shared/services/tournamentService'

export type TFormat = 'league' | 'knockout' | 'league_ko' | 'double_elim'
export type TStatus = 'draft' | 'registration' | 'ongoing' | 'completed'

export interface TTeam {
    id: string
    name: string
    short: string
    color: string
    captain: string
    players: TPlayer[]
    groupId?: string
    registered: boolean
}

export interface TPlayer {
    id: string
    name: string
    number: number
    role: 'raider' | 'defender' | 'all-rounder' | 'captain'
}

export interface TGroup {
    id: string
    name: string
    teamIds: string[]
}

export interface TRound {
    id: string
    name: string
    type: 'league' | 'quarterfinal' | 'semifinal' | 'final' | 'knockout'
    order: number
}

export interface TFixture {
    id: string
    roundId: string
    teamAId: string
    teamBId: string
    groupId?: string
    date: string
    time: string
    court: string
    status: 'scheduled' | 'live' | 'completed'
    scoreA?: number
    scoreB?: number
}

export interface Tournament {
    id: string
    name: string
    banner?: string
    organizer: string
    contact: string
    contactWhatsapp?: string
    contactEmail?: string
    contactAlternate?: string
    logo?: string
    level: string
    venue: string
    cityState: string
    district?: string
    state?: string
    groundType: 'mat' | 'mud'
    isIndoor: boolean
    mapsLink?: string
    startDate: string
    endDate: string
    format: TFormat
    halfDuration: number
    squadSize: number
    playersOnCourt: number
    raidTimer: number
    allOutPoints: number
    doOrDie: boolean
    courts: number
    superTackle: boolean
    bonusLine: boolean
    entryFee: string
    prize: string
    status: TStatus
    setup_status?: {
        teams: 'pending' | 'in_progress' | 'completed';
        players: 'pending' | 'completed';
        rounds: 'pending' | 'completed';
        schedule: 'pending' | 'completed';
    };
    created_by?: string;
    teams: TTeam[]
    groups: TGroup[]
    rounds: TRound[]
    fixtures: TFixture[]
    createdAt: string
}

const KEY = 'pl.tournaments'

export function getAllTournaments(): Tournament[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function getTournament(id: string): Tournament | null {
    return getAllTournaments().find(t => t.id === id) || null
}

export function saveTournament(t: Tournament) {
    if (!t.setup_status) {
        t.setup_status = {
            teams: 'pending',
            players: 'pending',
            rounds: 'pending',
            schedule: 'pending'
        }
    }
    const all = getAllTournaments().filter(x => x.id !== t.id)
    all.unshift(t)
    try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { }
    
    // Background sync to Supabase (non-blocking)
    syncFullTournament(t).catch((err: any) => console.error('Cloud sync failed:', err))
}

export function updateTournament(id: string, patch: Partial<Tournament>) {
    const t = getTournament(id)
    if (!t) return
    saveTournament({ ...t, ...patch })
}

// ── Schedule generation ───────────────────────────────────────────
export function generateLeagueFixtures(
    teams: TTeam[],
    groups: TGroup[],
    rounds: TRound[],
    startDate: string,
    courts: number,
    matchDurationMins: number
): TFixture[] {
    const fixtures: TFixture[] = []
    let fixtureNum = 0
    const baseDate = new Date(startDate)
    const SLOT_GAP = matchDurationMins + 15 // match + 15min break

    const addFixture = (tA: string, tB: string, roundId: string, groupId?: string) => {
        const slotIndex = Math.floor(fixtureNum / courts)
        const courtIndex = (fixtureNum % courts) + 1
        const matchDate = new Date(baseDate)
        matchDate.setMinutes(matchDate.getMinutes() + slotIndex * SLOT_GAP)
        const dateStr = matchDate.toISOString().split('T')[0]
        const hours = Math.floor((matchDate.getHours() * 60 + matchDate.getMinutes()) / 60)
        const mins = (matchDate.getHours() * 60 + matchDate.getMinutes()) % 60
        const timeStr = `${String(hours % 12 || 12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`

        fixtures.push({
            id: `f-${Date.now()}-${fixtureNum}`,
            roundId,
            teamAId: tA,
            teamBId: tB,
            groupId,
            date: dateStr,
            time: timeStr,
            court: `Court ${courtIndex}`,
            status: 'scheduled',
        })
        fixtureNum++
    }

    if (groups.length > 0) {
        // Group stage round-robin
        const groupRound = rounds.find(r => r.type === 'league')
        if (groupRound) {
            groups.forEach(g => {
                const gTeams = g.teamIds
                for (let i = 0; i < gTeams.length; i++) {
                    for (let j = i + 1; j < gTeams.length; j++) {
                        addFixture(gTeams[i], gTeams[j], groupRound.id, g.id)
                    }
                }
            })
        }
    } else {
        // Pure round-robin
        const leagueRound = rounds.find(r => r.type === 'league')
        if (leagueRound) {
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    addFixture(teams[i].id, teams[j].id, leagueRound.id)
                }
            }
        }
    }

    // Knockout placeholders
    const koRounds = rounds.filter(r => r.type !== 'league').sort((a, b) => a.order - b.order)
    koRounds.forEach(round => {
        addFixture('TBD', 'TBD', round.id)
    })

    return fixtures
}

export function generateKnockoutFixtures(
    teams: TTeam[],
    rounds: TRound[],
    startDate: string,
    courts: number,
    matchDurationMins: number
): TFixture[] {
    const fixtures: TFixture[] = []
    let fixtureNum = 0
    const baseDate = new Date(startDate)
    const SLOT_GAP = matchDurationMins + 15

    rounds.sort((a, b) => a.order - b.order).forEach((round, ri) => {
        // Matches in round: Round 0 = teams/2. Subsequent rounds = previous_round_matches / 2
        // We use a simple power of 2 based on reverse order if not the first round
        const matchesInRound = ri === 0 ? Math.floor(teams.length / 2) : Math.max(1, Math.pow(2, rounds.length - ri - 1))
        for (let m = 0; m < matchesInRound; m++) {
            const slotIndex = Math.floor(fixtureNum / courts)
            const courtIndex = (fixtureNum % courts) + 1
            const matchDate = new Date(baseDate)
            matchDate.setMinutes(matchDate.getMinutes() + slotIndex * SLOT_GAP)
            const dateStr = matchDate.toISOString().split('T')[0]
            const h = matchDate.getHours()
            const min = matchDate.getMinutes()
            const timeStr = `${String(h % 12 || 12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

            const tA = ri === 0 && m * 2 < teams.length ? teams[m * 2].id : 'TBD'
            const tB = ri === 0 && m * 2 + 1 < teams.length ? teams[m * 2 + 1].id : 'TBD'

            fixtures.push({
                id: `f-${Date.now()}-${fixtureNum}`,
                roundId: round.id,
                teamAId: tA,
                teamBId: tB,
                date: dateStr,
                time: timeStr,
                court: `Court ${courtIndex}`,
                status: 'scheduled',
            })
            fixtureNum++
        }
    })

    return fixtures
}