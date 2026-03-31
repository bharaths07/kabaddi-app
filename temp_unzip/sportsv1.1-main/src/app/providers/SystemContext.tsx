import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SystemContextType {
    notifications: any[];
    notificationsEnabled: boolean;
    matchStartEnabled: boolean;
    matchResultEnabled: boolean;
    tournamentNotificationsEnabled: boolean;
    preferences: {
        sport: string;
        timezone: string;
        language: string;
        theme: 'light' | 'dark';
        accent: 'amber' | 'green' | 'pink' | 'violet' | 'red' | 'blue';
        denseMode: boolean;
        showAnimations: boolean;
        publicProfile: boolean;
        showOnlineStatus: boolean;
    };
    setNotificationsEnabled: (enabled: boolean) => void;
    setMatchStartEnabled: (enabled: boolean) => void;
    setMatchResultEnabled: (enabled: boolean) => void;
    setTournamentNotificationsEnabled: (enabled: boolean) => void;
    updatePreferences: (prefs: Partial<SystemContextType['preferences']>) => void;
    dismissNotification: (id: string) => void;
    clearAllNotifications: () => void;
    maybeNotify: (payload: {
        type: 'match_start' | 'match_result' | 'tournament_event';
        title: string;
        body: string;
        key: string;
        relatedMatchId?: string;
        relatedTournamentId?: string;
    }) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<any[]>(() => {
        const saved = localStorage.getItem('scoreheroes_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [notificationKeys, setNotificationKeys] = useState<string[]>(() => {
        const saved = localStorage.getItem('scoreheroes_notification_keys');
        return saved ? JSON.parse(saved) : [];
    });
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('scoreheroes_notifications_enabled');
        return saved ? JSON.parse(saved) : true;
    });
    const [matchStartEnabled, setMatchStartEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('scoreheroes_match_start_enabled');
        return saved ? JSON.parse(saved) : true;
    });
    const [matchResultEnabled, setMatchResultEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('scoreheroes_match_result_enabled');
        return saved ? JSON.parse(saved) : true;
    });
    const [tournamentNotificationsEnabled, setTournamentNotificationsEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('scoreheroes_tournament_notifications_enabled');
        return saved ? JSON.parse(saved) : true;
    });
    const [preferences, setPreferences] = useState<SystemContextType['preferences']>(() => {
        const saved = localStorage.getItem('scoreheroes_preferences');
        return saved ? JSON.parse(saved) : {
            sport: 'Cricket',
            timezone: 'Asia/Kolkata',
            language: 'English',
            theme: 'light',
            accent: 'amber',
            denseMode: false,
            showAnimations: true,
            publicProfile: true,
            showOnlineStatus: true
        };
    });

    useEffect(() => {
        localStorage.setItem('scoreheroes_notifications', JSON.stringify(notifications));
    }, [notifications]);
    useEffect(() => {
        localStorage.setItem('scoreheroes_notification_keys', JSON.stringify(notificationKeys));
    }, [notificationKeys]);
    useEffect(() => {
        localStorage.setItem('scoreheroes_notifications_enabled', JSON.stringify(notificationsEnabled));
    }, [notificationsEnabled]);
    useEffect(() => {
        localStorage.setItem('scoreheroes_match_start_enabled', JSON.stringify(matchStartEnabled));
    }, [matchStartEnabled]);
    useEffect(() => {
        localStorage.setItem('scoreheroes_match_result_enabled', JSON.stringify(matchResultEnabled));
    }, [matchResultEnabled]);
    useEffect(() => {
        localStorage.setItem('scoreheroes_tournament_notifications_enabled', JSON.stringify(tournamentNotificationsEnabled));
    }, [tournamentNotificationsEnabled]);
    useEffect(() => {
        localStorage.setItem('scoreheroes_preferences', JSON.stringify(preferences));
    }, [preferences]);

    useEffect(() => {
        const root = document.documentElement;
        if (preferences.theme === 'dark') root.classList.add('dark-theme');
        else root.classList.remove('dark-theme');
        const accentMap: Record<string, string> = {
            amber: '#f59e0b', green: '#22c55e', pink: '#ec4899', violet: '#7c3aed', red: '#ef4444', blue: '#2563eb'
        };
        root.style.setProperty('--accent', accentMap[preferences.accent]);
    }, [preferences.theme, preferences.accent]);

    const updatePreferences = useCallback((prefs: Partial<SystemContextType['preferences']>) => {
        setPreferences(prev => ({ ...prev, ...prefs }));
    }, []);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const maybeNotify = (payload: {
        type: 'match_start' | 'match_result' | 'tournament_event';
        title: string;
        body: string;
        key: string;
        relatedMatchId?: string;
        relatedTournamentId?: string;
    }) => {
        if (!notificationsEnabled) return;
        if (payload.type === 'match_start' && !matchStartEnabled) return;
        if (payload.type === 'match_result' && !matchResultEnabled) return;
        if (payload.type === 'tournament_event' && !tournamentNotificationsEnabled) return;
        if (notificationKeys.includes(payload.key)) return;

        const n = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            timestamp: new Date().toISOString(),
            relatedMatchId: payload.relatedMatchId,
            relatedTournamentId: payload.relatedTournamentId
        };

        setNotifications(prev => [n, ...prev]);
        setNotificationKeys(prev => [...prev, payload.key]);

        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                try {
                    new Notification(payload.title, { body: payload.body, silent: true });
                } catch { }
            }
        }
    };

    return (
        <SystemContext.Provider value={{
            notifications,
            notificationsEnabled,
            matchStartEnabled,
            matchResultEnabled,
            tournamentNotificationsEnabled,
            preferences,
            setNotificationsEnabled,
            setMatchStartEnabled,
            setMatchResultEnabled,
            setTournamentNotificationsEnabled,
            updatePreferences,
            dismissNotification,
            clearAllNotifications,
            maybeNotify
        }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (context === undefined) {
        throw new Error('useSystem must be used within a SystemProvider');
    }
    return context;
};
