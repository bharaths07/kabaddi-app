export interface PlayerStats {
    raids: number;
    tackles: number;
    superRaids: number;
    highFives: number;
}

export interface PlayerAttributes {
    speed: number;
    strength: number;
    tactics: number;
    agility: number;
    defense: number;
}

export interface Player {
    id: string;
    slug: string;
    name: string;
    role: 'Raider' | 'Defender' | 'All-Rounder';
    teamSlug: string;
    avatar: string;
    nationality: string;
    isActive: boolean;
    isStar: boolean;
    powerScore: number;
    stats: PlayerStats;
    attributes: PlayerAttributes;
    careerHistory: { season: string; team: string; points: number }[];
    user_id?: string;
    is_claimed?: boolean;
}

export const PLAYERS: Player[] = [
    {
        id: 'p-1',
        slug: 'pardeep-narwal',
        name: 'Pardeep Narwal',
        role: 'Raider',
        teamSlug: 'bengaluru-bulls',
        avatar: 'https://i.pravatar.cc/150?u=pardeep',
        nationality: 'IND',
        isActive: true,
        isStar: true,
        powerScore: 94,
        stats: { raids: 1600, tackles: 24, superRaids: 75, highFives: 0 },
        attributes: { speed: 85, strength: 80, tactics: 95, agility: 92, defense: 30 },
        careerHistory: [
            { season: 'Season 10', team: 'Bengaluru Bulls', points: 215 },
            { season: 'Season 9', team: 'UP Yoddha', points: 198 }
        ]
    },
    {
        id: 'p-2',
        slug: 'pawan-sehrawat',
        name: 'Pawan Sehrawat',
        role: 'Raider',
        teamSlug: 'telugu-titans',
        avatar: 'https://i.pravatar.cc/150?u=pawan',
        nationality: 'IND',
        isActive: true,
        isStar: true,
        powerScore: 96,
        stats: { raids: 1100, tackles: 65, superRaids: 40, highFives: 5 },
        attributes: { speed: 99, strength: 85, tactics: 90, agility: 98, defense: 45 },
        careerHistory: [
            { season: 'Season 10', team: 'Telugu Titans', points: 250 },
            { season: 'Season 8', team: 'Bengaluru Bulls', points: 304 }
        ]
    },
    {
        id: 'p-3',
        slug: 'fazel-atrachali',
        name: 'Fazel Atrachali',
        role: 'Defender',
        teamSlug: 'gujarat-giants',
        avatar: 'https://i.pravatar.cc/150?u=fazel',
        nationality: 'IRN',
        isActive: true,
        isStar: true,
        powerScore: 92,
        stats: { raids: 12, tackles: 450, superRaids: 0, highFives: 30 },
        attributes: { speed: 70, strength: 98, tactics: 95, agility: 75, defense: 99 },
        careerHistory: [
            { season: 'Season 10', team: 'Gujarat Giants', points: 65 },
            { season: 'Season 9', team: 'Puneri Paltan', points: 56 }
        ]
    },
    {
        id: 'p-4',
        slug: 'naveen-kumar',
        name: 'Naveen Kumar',
        role: 'Raider',
        teamSlug: 'dabang-delhi',
        avatar: 'https://i.pravatar.cc/150?u=naveen',
        nationality: 'IND',
        isActive: true,
        isStar: true,
        powerScore: 93,
        stats: { raids: 900, tackles: 15, superRaids: 20, highFives: 0 },
        attributes: { speed: 95, strength: 75, tactics: 88, agility: 96, defense: 25 },
        careerHistory: [
            { season: 'Season 10', team: 'Dabang Delhi', points: 180 },
            { season: 'Season 9', team: 'Dabang Delhi', points: 254 }
        ]
    }
];
