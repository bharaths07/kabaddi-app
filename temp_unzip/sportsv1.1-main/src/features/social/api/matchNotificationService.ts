import { supabase } from '@/shared/lib/supabase';
import { Match } from '@/features/matches/types/match';

export type MatchNotificationHandler = (match: Match, updateType: 'score' | 'status' | 'general') => void;

class MatchNotificationService {
    private subscriptions: Map<string, any> = new Map();

    subscribeToMatch(matchId: string, onUpdate: MatchNotificationHandler) {
        if (this.subscriptions.has(matchId)) return;

        console.log(`[NotificationService] Subscribing to match: ${matchId}`);

        const channel = supabase
            .channel(`match_updates_${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'matches',
                    filter: `id=eq.${matchId}`
                },
                (payload) => {
                    const updatedMatch = payload.new as Match;
                    const oldMatch = payload.old as Match;

                    let updateType: 'score' | 'status' | 'general' = 'general';

                    if (updatedMatch.status !== oldMatch.status) {
                        updateType = 'status';
                    } else if (
                        updatedMatch.homeParticipant.score !== oldMatch.homeParticipant.score ||
                        updatedMatch.awayParticipant.score !== oldMatch.awayParticipant.score
                    ) {
                        updateType = 'score';
                    }

                    onUpdate(updatedMatch, updateType);
                }
            )
            .subscribe();

        this.subscriptions.set(matchId, channel);
    }

    unsubscribeFromMatch(matchId: string) {
        const channel = this.subscriptions.get(matchId);
        if (channel) {
            channel.unsubscribe();
            this.subscriptions.delete(matchId);
            console.log(`[NotificationService] Unsubscribed from match: ${matchId}`);
        }
    }

    unsubscribeAll() {
        this.subscriptions.forEach((channel) => channel.unsubscribe());
        this.subscriptions.clear();
    }
}

export const matchNotificationService = new MatchNotificationService();
