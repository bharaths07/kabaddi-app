import { ImpactScore } from '@/shared/utils/cricketMetrics';

interface PosterConfig {
    player?: {
        firstName: string;
        lastName: string;
        initials: string;
        teamColor?: string;
    };
    stats?: ImpactScore;
    type: 'icon' | 'performance' | 'team_win';
    matchInfo: {
        homeTeam: string;
        awayTeam: string;
        date: string;
        result?: string; // e.g., "Royal Strikers won by 42 runs"
        winnerColor?: string;
    };
}

/**
 * Server-Side Pro Poster Generation Engine
 * 
 * This engine uses the standard Canvas API, which is compatible with:
 * 1. Browser (HTML5 Canvas)
 * 2. Node.js (node-canvas or skia-canvas)
 * 
 * To use on Node.js Server:
 * - Install 'canvas': `npm install canvas`
 * - Import `createCanvas` from 'canvas'
 * - Replace `document.createElement('canvas')` with `createCanvas(width, height)`
 * - Return buffer instead of dataURL if needed for file system or S3 upload.
 */
export const generatePosterImage = async (config: PosterConfig): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // --- SERVER SIDE ADAPTER START ---
            // In Node.js environment, use: const canvas = createCanvas(1080, 1350);
            const width = 1080;
            const height = 1350;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            // --- SERVER SIDE ADAPTER END ---

            const isIcon = config.type === 'icon';
            const isTeamWin = config.type === 'team_win';

            // --- 1. Background Layer ---
            const gradient = ctx.createLinearGradient(0, 0, 0, height);

            if (isTeamWin && config.matchInfo.winnerColor) {
                // Team Win: Dominant Team Color Gradient
                gradient.addColorStop(0, config.matchInfo.winnerColor);
                gradient.addColorStop(0.6, '#000000');
            } else if (isIcon) {
                // Icon: Deep Blue/Black + Gold hint
                gradient.addColorStop(0, '#0f172a');
                gradient.addColorStop(1, '#1e293b');
            } else {
                // Performance: Neutral Dark
                gradient.addColorStop(0, '#18181b');
                gradient.addColorStop(1, '#09090b');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add Texture (Subtle Noise/Pattern simulation)
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for (let i = 0; i < 8000; i++) {
                ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
            }

            // Cinematic Vignette (Dark corners)
            const vignette = ctx.createRadialGradient(width / 2, height / 2, height / 3, width / 2, height / 2, height);
            vignette.addColorStop(0, 'transparent');
            vignette.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, width, height);

            // --- 2. Border/Frame ---
            if (isIcon) {
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)'; // Gold
                ctx.lineWidth = 8;
                ctx.strokeRect(50, 50, width - 100, height - 100);

                // Corner Accents
                ctx.fillStyle = '#FFD700';
                const cornerSize = 20;
                ctx.fillRect(50, 50, cornerSize, 4); // TL
                ctx.fillRect(50, 50, 4, cornerSize);
                ctx.fillRect(width - 50 - cornerSize, 50, cornerSize, 4); // TR
                ctx.fillRect(width - 54, 50, 4, cornerSize);
                ctx.fillRect(50, height - 54, cornerSize, 4); // BL
                ctx.fillRect(50, height - 50 - cornerSize, 4, cornerSize);
                ctx.fillRect(width - 50 - cornerSize, height - 54, cornerSize, 4); // BR
                ctx.fillRect(width - 54, height - 50 - cornerSize, 4, cornerSize);

            } else if (isTeamWin) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 8;
                ctx.strokeRect(50, 50, width - 100, height - 100);
            }

            // --- 3. Header Branding ---
            ctx.textAlign = 'center';

            // "SCORE HEROES" Watermark
            ctx.font = '700 36px sans-serif';
            ctx.fillStyle = isIcon ? '#FFD700' : 'rgba(255,255,255,0.6)';
            ctx.letterSpacing = '4px';
            ctx.fillText('SCORE HEROES', width / 2, 140);
            ctx.letterSpacing = '0px'; // Reset

            // Title
            ctx.font = '900 80px sans-serif';
            ctx.fillStyle = 'white';

            if (isTeamWin) {
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 20;
                ctx.fillText('MATCH RESULT', width / 2, 240);
                ctx.shadowBlur = 0;
            } else if (isIcon) {
                // Gold Gradient Text
                const textGrad = ctx.createLinearGradient(0, 150, width, 150);
                textGrad.addColorStop(0.3, '#FFD700');
                textGrad.addColorStop(0.7, '#FDB931');
                ctx.fillStyle = textGrad;
                ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
                ctx.shadowBlur = 15;
                ctx.fillText('ICON OF THE MATCH', width / 2, 240);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillText('TOP PERFORMER', width / 2, 240);
            }

            // --- 4. Main Content ---
            if (isTeamWin) {
                // Team Win Specific Layout
                const centerY = height / 2;

                // Big Winner Text
                ctx.font = '900 130px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'middle';

                const winnerText = config.matchInfo.result?.split(' won')[0] || 'Team';
                // Wrap text logic simplified
                const words = winnerText.toUpperCase().split(' ');
                if (words.length > 2) {
                    ctx.font = '900 100px sans-serif';
                    ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), width / 2, centerY - 80);
                    ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), width / 2, centerY + 40);
                } else {
                    ctx.fillText(winnerText.toUpperCase(), width / 2, centerY - 20);
                }

                // "WON" Badge
                ctx.font = '700 60px sans-serif';
                ctx.fillStyle = '#4ade80'; // Green
                ctx.fillText('WON THE MATCH', width / 2, centerY + 150);

                // Result Detail
                if (config.matchInfo.result) {
                    ctx.font = '500 40px sans-serif';
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.fillText(config.matchInfo.result, width / 2, centerY + 250);
                }

            } else if (config.player && config.stats) {
                // --- Player Layout ---
                const centerX = width / 2;
                const centerY = height / 2 - 50;
                const radius = 320;

                // Glow Effect
                const glow = ctx.createRadialGradient(centerX, centerY, radius - 50, centerX, centerY, radius + 150);
                glow.addColorStop(0, 'rgba(255,255,255,0.15)');
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 150, 0, Math.PI * 2);
                ctx.fill();

                // Circle Background
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();

                // Inner Border
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 12;
                ctx.stroke();

                // Initials (Avatar Placeholder)
                ctx.font = '700 280px sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.textBaseline = 'middle';
                ctx.fillText(config.player.initials, centerX, centerY + 20);

                // --- Stats Pill Overlay ---
                const pillWidth = 700;
                const pillHeight = 160;
                const pillX = centerX - pillWidth / 2;
                const pillY = centerY + radius - 80;

                // Pill Shadow
                ctx.shadowColor = "rgba(0,0,0,0.6)";
                ctx.shadowBlur = 30;
                ctx.shadowOffsetY = 10;

                ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                ctx.beginPath();
                // Custom round rect
                ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 80);
                ctx.fill();

                ctx.shadowBlur = 0; // Reset shadow
                ctx.shadowOffsetY = 0;

                ctx.strokeStyle = isIcon ? '#FFD700' : 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Stat Text
                ctx.font = '800 80px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let statText = '';
                if (config.stats.details.runs > 0) statText = `${config.stats.details.runs} RUNS`;

                if (config.stats.details.wicketsTaken > 0) {
                    if (statText) statText += ` • ${config.stats.details.wicketsTaken} WKTS`;
                    else statText = `${config.stats.details.wicketsTaken} WICKETS`;
                }

                if (!statText && config.stats.details.catches > 0) statText = `${config.stats.details.catches} CATCHES`;

                // Dynamic Scaling for Long Text
                const textMetrics = ctx.measureText(statText);
                if (textMetrics.width > pillWidth - 60) {
                    ctx.font = '800 60px sans-serif';
                }

                ctx.fillText(statText, centerX, pillY + pillHeight / 2);

                // --- Footer Name ---
                ctx.textBaseline = 'alphabetic';

                // First Name
                ctx.font = '900 110px sans-serif';
                ctx.fillStyle = 'white';
                ctx.fillText(config.player.firstName.toUpperCase(), centerX, height - 340);

                // Last Name (Color accented)
                ctx.font = '900 110px sans-serif';
                ctx.fillStyle = isIcon ? '#FFD700' : '#94a3b8';
                ctx.fillText(config.player.lastName.toUpperCase(), centerX, height - 220);
            }

            // --- 5. Match Info Footer (Common) ---
            ctx.textAlign = 'center';
            ctx.font = '600 45px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(`${config.matchInfo.homeTeam} vs ${config.matchInfo.awayTeam}`, width / 2, height - 120);

            ctx.font = '400 35px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(config.matchInfo.date, width / 2, height - 60);

            // Resolve Data URL
            resolve(canvas.toDataURL('image/png'));
        } catch (e) {
            reject(e);
        }
    });
};
