export interface SportConfig {
    id: string; // Internal game ID (e.g., 'cricket')
    sportId: string; // Database ID (e.g., 's1')
    name: string;
    description: string;
    iconName: string; // Lucia icon name or string key
    categoryOptions: { label: string; value: string }[];
    ballTypeLabel: string;
    ballTypeOptions: { label: string; value: string }[];
    matchTypeLabel: string;
    matchTypeOptions: { label: string; value: string }[];
    pitchTypeLabel: string;
    pitchTypePlaceholder: string;
    comingSoon?: boolean;
}

export const SPORT_CONFIGS: Record<string, SportConfig> = {
    cricket: {
        id: 'cricket',
        sportId: 's1',
        name: 'Cricket',
        description: 'Create leagues, knockout tournaments, and series.',
        iconName: 'Trophy',
        categoryOptions: [
            { label: 'Open', value: 'OPEN' },
            { label: 'Corporate', value: 'CORPORATE' },
            { label: 'Community', value: 'COMMUNITY' },
            { label: 'School', value: 'SCHOOL' },
            { label: 'College', value: 'COLLEGE' },
            { label: 'University', value: 'UNIVERSITY' },
            { label: 'Series', value: 'SERIES' },
            { label: 'Other', value: 'OTHER' }
        ],
        ballTypeLabel: 'Ball Type',
        ballTypeOptions: [
            { label: 'Tennis', value: 'TENNIS' },
            { label: 'Leather', value: 'LEATHER' },
            { label: 'Other', value: 'OTHER' }
        ],
        matchTypeLabel: 'Match Type',
        matchTypeOptions: [
            { label: 'Limited Overs', value: 'LIMITED_OVERS' },
            { label: 'Box / Turf Cricket', value: 'BOX_TURF' },
            { label: 'Pair Cricket', value: 'PAIR_CRICKET' },
            { label: 'Test Match', value: 'TEST_MATCH' },
            { label: 'The Hundred', value: 'HUNDRED' }
        ],
        pitchTypeLabel: 'Pitch Type',
        pitchTypePlaceholder: 'e.g. Turf, Matting'
    },
    football: {
        id: 'football',
        sportId: 's2',
        name: 'Football',
        description: 'Organize tournaments with group stages and finals.',
        iconName: 'Activity',
        categoryOptions: [
            { label: 'Open', value: 'OPEN' },
            { label: 'Corporate', value: 'CORPORATE' },
            { label: 'Amateur League', value: 'AMATEUR' },
            { label: 'Youth Academy', value: 'YOUTH' },
            { label: 'Pro/Semi-Pro', value: 'PRO' }
        ],
        ballTypeLabel: 'Ball Size',
        ballTypeOptions: [
            { label: 'Size 5 (Standard)', value: 'SIZE_5' },
            { label: 'Size 4 (Futsal)', value: 'SIZE_4' },
            { label: 'Size 3 (Junior)', value: 'SIZE_3' }
        ],
        matchTypeLabel: 'Match Format',
        matchTypeOptions: [
            { label: '11-a-side', value: '11_SIDE' },
            { label: '7-a-side', value: '7_SIDE' },
            { label: '5-a-side (Futsal)', value: '5_SIDE' }
        ],
        pitchTypeLabel: 'Surface Type',
        pitchTypePlaceholder: 'e.g. Natural Grass, Artificial Turf, Indoor'
    },
    badminton: {
        id: 'badminton',
        sportId: 's4',
        name: 'Badminton',
        description: 'Manage singles and doubles tournaments.',
        iconName: 'Users',
        categoryOptions: [
            { label: 'Open', value: 'OPEN' },
            { label: 'Singles Only', value: 'SINGLES' },
            { label: 'Doubles Only', value: 'DOUBLES' },
            { label: 'Mixed Doubles', value: 'MIXED' }
        ],
        ballTypeLabel: 'Shuttlecock',
        ballTypeOptions: [
            { label: 'Feather', value: 'FEATHER' },
            { label: 'Nylon/Synthetic', value: 'NYLON' }
        ],
        matchTypeLabel: 'Tournament Type',
        matchTypeOptions: [
            { label: 'Knockout', value: 'KNOCKOUT' },
            { label: 'Round Robin', value: 'ROUND_ROBIN' },
            { label: 'Swiss System', value: 'SWISS' }
        ],
        pitchTypeLabel: 'Court Surface',
        pitchTypePlaceholder: 'e.g. Synthetic Mat, Wood, Cement'
    },
    kabaddi: {
        id: 'kabaddi',
        sportId: 's3',
        name: 'Kabaddi',
        description: 'Create kabaddi tournaments and track standings.',
        iconName: 'Shield',
        categoryOptions: [
            { label: 'Open', value: 'OPEN' },
            { label: 'Rural/Gold Cup', value: 'RURAL' },
            { label: 'Pro Style', value: 'PRO' },
            { label: 'Weight Restricted', value: 'WEIGHT_RESTRICTED' }
        ],
        ballTypeLabel: 'Format',
        ballTypeOptions: [
            { label: 'Standard', value: 'STANDARD' },
            { label: 'Circle Style', value: 'CIRCLE' },
            { label: 'Beach Kabaddi', value: 'BEACH' }
        ],
        matchTypeLabel: 'Match Duration',
        matchTypeOptions: [
            { label: '40 Mins (20-5-20)', value: '40_MINS' },
            { label: '30 Mins (15-5-15)', value: '30_MINS' },
            { label: 'Pro Style (PKL)', value: 'PRO_STYLE' }
        ],
        pitchTypeLabel: 'Matt Type',
        pitchTypePlaceholder: 'e.g. Synthetic Matt, Mud'
    }
};

export const GAMES = Object.values(SPORT_CONFIGS);
