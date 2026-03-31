import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { playerService } from '@/features/players/api/playerService';
import { Player } from '@/features/players/types/player';
import { GameProfile } from '@/features/players/types/gameProfile';

interface PlayerContextType {
    players: Player[];
    gameProfiles: GameProfile[];
    addPlayer: (player: Player) => Promise<void>;
    updatePlayerState: (player: Player) => void;
    updatePlayers: () => void;
    refreshPlayers: () => Promise<void>;
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [players, setPlayers] = useState<Player[]>(() => {
        try {
            const saved = localStorage.getItem('scoreheroes_players');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [gameProfiles] = useState<GameProfile[]>([]);

    const refreshPlayers = useCallback(async () => {
        try {
            const fetchedPlayers = await playerService.getAllPlayers();
            if (fetchedPlayers.length > 0) {
                setPlayers(fetchedPlayers);
            }
        } catch (error) {
            console.error('Failed to refresh players:', error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('scoreheroes_players', JSON.stringify(players));
    }, [players]);

    const addPlayer = async (player: Player) => {
        try {
            const newPlayer = await playerService.createPlayer(player);
            setPlayers(prev => [newPlayer, ...prev]);
        } catch (error) {
            console.error('Failed to create player:', error);
            alert('Failed to create player.');
        }
    };

    const updatePlayerState = (player: Player) => {
        setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
    };

    const updatePlayers = () => { refreshPlayers(); };

    return (
        <PlayerContext.Provider value={{
            players,
            gameProfiles,
            addPlayer,
            updatePlayerState,
            updatePlayers,
            refreshPlayers,
            setPlayers
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayers = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayers must be used within a PlayerProvider');
    }
    return context;
};
