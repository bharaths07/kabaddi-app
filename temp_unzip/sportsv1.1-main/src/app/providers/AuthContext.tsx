import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { profileService } from '@/features/players/api/profileService';
import { User } from '@/features/players/types/user';
import { shouldBypassAuth } from '@/features/auth/utils/authBypass';

interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    authLoading: boolean;
    devAuthBypassActive: boolean;
    login: (email: string, password: string, name?: string) => Promise<void>;
    loginWithSupabase: (email: string, name?: string) => Promise<void>;
    loginWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
    loginAsGuest: () => void;
    logout: () => void;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [devAuthBypassActive, setDevAuthBypassActive] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    });

    // Step 3 — Centralized Auth State Manager
    useEffect(() => {
        let mounted = true;

        const handleUserSession = async (authUser: any) => {
            console.log('[AuthGate] Handling user session for:', authUser.id);

            try {
                const profile = await profileService.getProfile(authUser.id) as User | null;
                console.log('[AuthGate] Profile fetch result:', profile ? 'Found' : 'Missing');

                if (mounted) {
                    if (profile) {
                        setCurrentUser(profile);
                    } else {
                        setCurrentUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            phone: authUser.phone,
                            name: authUser.user_metadata?.name ?? '',
                            role: 'user'
                        });
                    }
                }
            } catch (err) {
                console.error("[AuthGate] Error fetching profile:", err);
                if (mounted) {
                    setCurrentUser({
                        id: authUser.id,
                        email: authUser.email || '',
                        phone: authUser.phone,
                        name: '',
                        role: 'user'
                    });
                }
            }
        };

        const initAuth = async () => {
            console.log('[AuthGate] Initializing auth...');
            const safetyTimeout = setTimeout(() => {
                if (mounted) setAuthLoading(false);
            }, 2500);

            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (!data.session) {
                    const legacyUser = localStorage.getItem('scoreheroes_user');
                    if (legacyUser && mounted) {
                        try {
                            setCurrentUser(JSON.parse(legacyUser));
                        } catch {
                            setCurrentUser(null);
                        }
                    } else if (mounted) {
                        setCurrentUser(null);
                    }
                    return;
                }

                if (data.session.user) {
                    await handleUserSession(data.session.user);
                }
            } catch (error) {
                console.error('[AuthGate] Initialization error:', error);
                if (mounted) setCurrentUser(null);
            } finally {
                clearTimeout(safetyTimeout);
                if (mounted) setAuthLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                if (mounted) setCurrentUser(null);
            } else if (session?.user) {
                await handleUserSession(session.user);
            }
            if (mounted) setAuthLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Development/Test auth bypass
    useEffect(() => {
        const env = import.meta.env as { PROD: boolean; VITE_AUTH_BYPASS?: string };
        if (shouldBypassAuth(env) && !currentUser) {
            const devUser: User = {
                id: 'dev-bypass-user',
                name: 'Developer Mode',
                email: 'dev@local',
                role: 'admin',
                firstName: 'Dev',
                lastName: 'Bypass',
                memberSince: new Date().getFullYear().toString(),
                followersCount: 0,
                followingCount: 0,
                profileViews: 0,
                type: 'user'
            };
            setCurrentUser(devUser);
            setDevAuthBypassActive(true);
        } else {
            setDevAuthBypassActive(false);
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('scoreheroes_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('scoreheroes_user');
        }
    }, [currentUser]);

    const login = async (email: string, password: string, name?: string) => {
        const hashPassword = async (pwd: string) => {
            const msgBuffer = new TextEncoder().encode(pwd);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const hashedPassword = await hashPassword(password);
        let user = users.find(u => u.email === email);

        if (user) {
            if (user.passwordHash && user.passwordHash !== hashedPassword) {
                throw new Error('Invalid password');
            }
            if (!user.passwordHash) {
                const updatedUser = { ...user, passwordHash: hashedPassword };
                setUsers(prev => prev.map(u => u.id === user!.id ? updatedUser : u));
                user = updatedUser;
            }
        } else {
            const displayName = name || email.split('@')[0];
            const nameParts = displayName.split(' ');
            const newUser: User = {
                id: crypto.randomUUID(),
                name: displayName,
                email,
                passwordHash: hashedPassword,
                role: 'user',
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ') || '',
                memberSince: new Date().getFullYear().toString(),
                followersCount: 0,
                followingCount: 0,
                profileViews: 0,
                type: 'organizer'
            };
            user = newUser;
            setUsers(prev => [...prev, newUser]);
        }
        setCurrentUser(user);
    };

    const loginWithSupabase = async (email: string, name?: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: name ? { name } : undefined,
            },
        });
        if (error) throw error;
    };

    const loginWithPhone = async (phone: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone });
            if (error) throw error;
            localStorage.setItem('otp_requested_at', Date.now().toString());
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const verifyOtp = async (phone: string, token: string) => {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            });
            if (error) throw error;

            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profile) {
                    const user: User = {
                        id: profile.id,
                        name: profile.name || 'User',
                        email: '',
                        phone: phone,
                        role: 'user',
                        avatarUrl: profile.avatar_url
                    };
                    setCurrentUser(user);
                } else {
                    const newUser: User = {
                        id: data.user.id,
                        name: 'New User',
                        email: '',
                        phone: phone,
                        role: 'user'
                    };
                    setCurrentUser(newUser);
                }
                return { success: true };
            }
            return { success: false, error: 'Invalid OTP' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const loginAsGuest = () => {
        const guestUser: User = {
            id: 'guest-' + Date.now(),
            name: 'Guest User',
            email: 'guest@playlegends.app',
            role: 'user',
            firstName: 'Guest',
            lastName: 'User',
            memberSince: new Date().getFullYear().toString(),
            followersCount: 0,
            followingCount: 0,
            profileViews: 0,
            type: 'user'
        };
        setCurrentUser(guestUser);
    };

    const updateUserProfile = async (data: Partial<User>) => {
        if (!currentUser) return;
        const updates: Partial<User> = { ...data };
        if (data.firstName || data.lastName) {
            const currentFirst = currentUser.name ? currentUser.name.split(' ')[0] : '';
            const currentLast = currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : '';
            const first = data.firstName !== undefined ? data.firstName : currentFirst;
            const last = data.lastName !== undefined ? data.lastName : currentLast;
            updates.name = `${first} ${last}`.trim();
        }

        try {
            const updatedProfile = await profileService.updateProfile(currentUser.id, updates);
            if (updatedProfile) {
                setCurrentUser({ ...currentUser, ...data, ...updatedProfile });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            setCurrentUser,
            authLoading,
            devAuthBypassActive,
            login,
            loginWithSupabase,
            loginWithPhone,
            verifyOtp,
            loginAsGuest,
            logout,
            updateUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
