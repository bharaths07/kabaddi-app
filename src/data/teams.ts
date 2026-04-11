export interface TeamRecentForm {
    result: 'W' | 'D' | 'L';
    opponent: string;
}

export interface Team {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    logo: string;
    coach: string;
    city: string;
    primaryColor: string;
    stats: {
        matches: number;
        wins: number;
        losses: number;
        draws: number;
        points: number;
        rank: number;
    };
    recentForm: TeamRecentForm[];
}

export const TEAMS: Team[] = [
    {
        id: 't-1',
        slug: 'bengaluru-bulls',
        name: 'Bengaluru Bulls',
        shortName: 'BLR',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=BLR&backgroundColor=ef4444',
        coach: 'Randhir Singh',
        city: 'Bengaluru',
        primaryColor: '#ef4444',
        stats: { matches: 22, wins: 15, losses: 5, draws: 2, points: 82, rank: 1 },
        recentForm: [
            { result: 'W', opponent: 'PUN' },
            { result: 'W', opponent: 'UP' },
            { result: 'L', opponent: 'DEL' },
            { result: 'W', opponent: 'PAT' },
            { result: 'D', opponent: 'TEL' }
        ]
    },
    {
        id: 't-2',
        slug: 'dabang-delhi',
        name: 'Dabang Delhi KC',
        shortName: 'DEL',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=DEL&backgroundColor=0284c7',
        coach: 'Rambir Singh',
        city: 'Delhi',
        primaryColor: '#0284c7',
        stats: { matches: 22, wins: 14, losses: 6, draws: 2, points: 78, rank: 2 },
        recentForm: [
            { result: 'L', opponent: 'JAI' },
            { result: 'W', opponent: 'GUJ' },
            { result: 'W', opponent: 'BLR' },
            { result: 'W', opponent: 'PUN' },
            { result: 'W', opponent: 'MUM' }
        ]
    },
    {
        id: 't-3',
        slug: 'telugu-titans',
        name: 'Telugu Titans',
        shortName: 'TEL',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=TEL&backgroundColor=f59e0b',
        coach: 'Srinivas Reddy',
        city: 'Hyderabad',
        primaryColor: '#f59e0b',
        stats: { matches: 22, wins: 5, losses: 15, draws: 2, points: 30, rank: 12 },
        recentForm: [
            { result: 'L', opponent: 'UP' },
            { result: 'L', opponent: 'MUM' },
            { result: 'D', opponent: 'PAT' },
            { result: 'L', opponent: 'JAI' },
            { result: 'D', opponent: 'BLR' }
        ]
    },
    {
        id: 't-4',
        slug: 'gujarat-giants',
        name: 'Gujarat Giants',
        shortName: 'GUJ',
        logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=GUJ&backgroundColor=ea580c',
        coach: 'Ram Mehar Singh',
        city: 'Ahmedabad',
        primaryColor: '#ea580c',
        stats: { matches: 22, wins: 12, losses: 8, draws: 2, points: 65, rank: 4 },
        recentForm: [
            { result: 'W', opponent: 'PAT' },
            { result: 'L', opponent: 'DEL' },
            { result: 'W', opponent: 'BEN' },
            { result: 'W', opponent: 'UP' },
            { result: 'W', opponent: 'MUM' }
        ]
    }
];
