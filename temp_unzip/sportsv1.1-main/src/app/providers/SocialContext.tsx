import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { feedService } from '@/features/social/api/feedService';
import { achievementService } from '@/features/stats/api/achievementService';
import { certificateService } from '@/features/certificates/api/certificateService';
import { FeedItem } from '@/features/social/types/feed';
import { Achievement } from '@/features/stats/types/achievement';
import { Certificate } from '@/features/certificates/types/certificate';

interface SocialContextType {
    feedItems: FeedItem[];
    achievements: Achievement[];
    certificates: Certificate[];
    updateFeed: () => void;
    refreshSocialData: () => Promise<void>;
    setFeedItems: React.Dispatch<React.SetStateAction<FeedItem[]>>;
    setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
    setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
        try {
            const saved = localStorage.getItem('feedItems');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [achievements, setAchievements] = useState<Achievement[]>(() => {
        try {
            const saved = localStorage.getItem('achievements');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [certificates, setCertificates] = useState<Certificate[]>(() => {
        try {
            const saved = localStorage.getItem('certificates');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const refreshSocialData = useCallback(async () => {
        try {
            const [fetchedFeed, fetchedAchievements, fetchedCertificates] = await Promise.all([
                feedService.getAllFeedItems(),
                achievementService.getAllAchievements(),
                certificateService.getAllCertificates()
            ]);
            setFeedItems(fetchedFeed);
            setAchievements(fetchedAchievements);
            setCertificates(fetchedCertificates);
        } catch (error) {
            console.error('Failed to refresh social data:', error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('feedItems', JSON.stringify(feedItems));
    }, [feedItems]);

    useEffect(() => {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }, [achievements]);

    useEffect(() => {
        localStorage.setItem('certificates', JSON.stringify(certificates));
    }, [certificates]);

    const updateFeed = () => { refreshSocialData(); };

    return (
        <SocialContext.Provider value={{
            feedItems,
            achievements,
            certificates,
            updateFeed,
            refreshSocialData,
            setFeedItems,
            setAchievements,
            setCertificates
        }}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (context === undefined) {
        throw new Error('useSocial must be used within a SocialProvider');
    }
    return context;
};
