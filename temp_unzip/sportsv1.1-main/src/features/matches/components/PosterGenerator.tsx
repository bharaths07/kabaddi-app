import React, { useEffect, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { ImpactScore } from '@/shared/utils/cricketMetrics';
import { generatePosterImage } from './PosterCanvasEngine';
import { Match } from '@/features/matches/types/match';

interface Props {
    data: { player?: ImpactScore, type: 'icon' | 'performance' | 'team_win' } | null;
    match: Match;
    onClose: () => void;
}

export const PosterGenerator: React.FC<Props> = ({ data, match, onClose }) => {
    const { players } = useGlobalState();
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (data && match) {
            setLoading(true);
            setImageUrl(null);

            const player = data.player ? players.find(p => p.id === data.player?.playerId) : undefined;

            // Prepare config
            const config: Record<string, unknown> = {
                type: data.type,
                matchInfo: {
                    homeTeam: match.homeParticipant.name,
                    awayTeam: match.awayParticipant.name,
                    date: new Date(match.date).toLocaleDateString(),
                    result: match.status === 'completed' && match.winnerId
                        ? `${match.winnerId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name} won`
                        : undefined,
                    winnerColor: match.winnerId === match.homeParticipant.id ? '#10b981' : '#3b82f6' // Mock colors
                }
            };

            if (player && data.player) {
                const fInitial = player.firstName?.[0] || '';
                const lInitial = player.lastName?.[0] || '';
                config.player = {
                    firstName: player.firstName,
                    lastName: player.lastName,
                    initials: `${fInitial}${lInitial}`,
                    teamColor: undefined
                };
                config.stats = data.player;
            }

            // Generate the poster using the Canvas Engine
            generatePosterImage(config as any).then(url => {
                setImageUrl(url);
                setLoading(false);
            }).catch(err => {
                console.error("Poster Generation Failed", err);
                setLoading(false);
            });
        }
    }, [data, match, players]);

    if (!data) return null;

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            const filename = data.type === 'team_win'
                ? `PlayLegends_Poster_Match_${match.id}.png`
                : `PlayLegends_Poster_${data.player?.playerId || 'player'}.png`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            {loading && (
                <div className="text-center text-white">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-5 text-blue-500" />
                    <div className="text-lg font-semibold">Generating Pro Poster...</div>
                    <div className="text-sm opacity-70 mt-2">Using High-Fidelity Canvas Engine</div>
                </div>
            )}

            {!loading && imageUrl && (
                <>
                    <div className="mb-5 text-white text-sm font-medium">
                        Ready to Share
                    </div>

                    {/* Poster Preview */}
                    <div className="shadow-2xl max-h-[70vh] max-w-[90vw] overflow-hidden border border-white/10 rounded-lg bg-slate-900">
                        <img src={imageUrl} alt="Generated Poster" className="max-h-full max-w-full block" />
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="px-6 py-3 rounded-full bg-green-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download / Share
                        </button>
                        {/* Legacy poster generation call - added as a comment to maintain syntactic correctness */}
                        {/* const result = await (window as any).generatePoster({
                        type: 'match_result',
                        matchInfo: match
                    } as any); */}
                    </div>
                    <div className="mt-3 text-slate-400 text-xs">
                        High-Res (1080x1350) • Generated Locally
                    </div>
                </>
            )}
        </div>
    );
};
