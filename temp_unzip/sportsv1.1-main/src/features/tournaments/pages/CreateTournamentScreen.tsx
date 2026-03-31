import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Trophy, Upload, Image as ImageIcon, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { Tournament } from '@/features/tournaments/types/tournament';
import { Input } from '@/shared/components/ui/Input';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { SuccessOverlay } from '@/shared/components/ui/SuccessOverlay';
import { SPORT_CONFIGS } from '../constants/sportConfigs';

export const CreateTournamentScreen: React.FC = () => {
    const navigate = useNavigate();
    const requireAuth = useRequireAuth();
    const [searchParams] = useSearchParams();
    const editTournamentId = searchParams.get('edit');
    const gameIdParam = searchParams.get('game');
    const isEditMode = Boolean(editTournamentId);

    const { currentUser, addTournament, updateTournament, tournaments, matches } = useGlobalState();

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [pendingNavigate, setPendingNavigate] = useState<string | null>(null);

    // Route Protection & Game Selection Check
    useEffect(() => {
        requireAuth(currentUser);

        // If creating new tournament and no game selected, redirect to selection
        if (!isEditMode && !gameIdParam) {
            navigate('/tournament/create');
        }
    }, [currentUser, requireAuth, isEditMode, gameIdParam, navigate]);

    // Dynamic Sport Configuration
    const sportConfig = SPORT_CONFIGS[gameIdParam || 'cricket'] || SPORT_CONFIGS['cricket'];
    const sportName = sportConfig.name;
    const sportId = sportConfig.sportId;

    // Step 1 State: Identity
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [ground, setGround] = useState('');

    // Step 2 State: Dates
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Step 3 State: Category
    const [category, setCategory] = useState('');

    // Step 4 State: Playing Conditions
    const [ballType, setBallType] = useState('');
    const [pitchType, setPitchType] = useState('');
    const [matchType, setMatchType] = useState('');

    // Step 5 State: Requirements (Removed unused states)

    // Step 6 State: Branding
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isBannerDragActive, setIsBannerDragActive] = useState(false);
    const [isLogoDragActive, setIsLogoDragActive] = useState(false);

    // View State: 'form' | 'review'
    const [view, setView] = useState<'form' | 'review'>('form');

    // Check if matches exist (to lock structural fields)
    const hasMatches = isEditMode ? matches.some((m: any) => m.tournamentId === editTournamentId) : false;

    const CATEGORY_OPTIONS = sportConfig.categoryOptions;
    const BALL_TYPE_OPTIONS = sportConfig.ballTypeOptions;
    const MATCH_TYPE_OPTIONS = sportConfig.matchTypeOptions;

    // Auto-fill city from user profile if available (only if not editing)
    useEffect(() => {
        if (!isEditMode && currentUser?.location && !city) {
            setCity(currentUser.location);
        }
    }, [currentUser, city, isEditMode]);

    // Load Tournament Data in Edit Mode
    useEffect(() => {
        if (!isEditMode || !editTournamentId) return;

        const tournament = tournaments.find((t: any) => t.id === editTournamentId);
        if (!tournament) return;

        setName(tournament.name);
        setCity(tournament.location);
        setGround(tournament.ground || '');

        // Dates
        if (tournament.startDate) setStartDate(tournament.startDate);
        if (tournament.endDate) setEndDate(tournament.endDate);

        // Extra fields
        if (tournament.category) setCategory(tournament.category);
        if (tournament.ballType) setBallType(tournament.ballType);
        if (tournament.pitchType) setPitchType(tournament.pitchType);
        if (tournament.matchType) setMatchType(tournament.matchType);
        if (tournament.bannerUrl) setBannerUrl(tournament.bannerUrl);

    }, [isEditMode, editTournamentId, tournaments]);

    // Validation
    const isIdentityValid = name.trim().length > 0 && city.trim().length > 0 && ground.trim().length > 0;
    const isDatesValid = startDate !== '' && endDate !== '' && endDate >= startDate;
    const isCategoryValid = category !== '';
    const isPlayingConditionsValid = ballType !== '' && matchType !== '';

    const isFormValid = isIdentityValid && isDatesValid && isCategoryValid && isPlayingConditionsValid;

    // File Validation & Handling
    const validateFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload JPG, PNG, or GIF.');
            return false;
        }
        if (file.size > maxSize) {
            alert('File size exceeds 5MB limit.');
            return false;
        }
        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            const fakeUrl = URL.createObjectURL(file);
            setUrl(fakeUrl);
        }
    };

    const handleDrop = (e: React.DragEvent, setUrl: (url: string) => void, setDragActive: (active: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            const fakeUrl = URL.createObjectURL(file);
            setUrl(fakeUrl);
        }
    };

    const handleDragOver = (e: React.DragEvent, setDragActive: (active: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent, setDragActive: (active: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleNext = () => {
        if (isFormValid) {
            if (view === 'form') {
                setView('review');
                window.scrollTo(0, 0);
            } else {
                if (!requireAuth(currentUser)) return;

                const commonData = {
                    name,
                    organizer: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Organizer',
                    dates: `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    location: city,
                    description: `${category} Tournament (${matchType})`,
                    bannerUrl: bannerUrl || 'https://placehold.co/1200x300/2563EB/ffffff?text=Tournament',
                    category,
                    ballType,
                    pitchType,
                    matchType,
                    ground,
                    startDate,
                    endDate,
                    sportId: isEditMode ? undefined : sportId, // Only set on creation
                };

                if (isEditMode && editTournamentId) {
                    // Update Existing
                    const existingTournament = tournaments.find((t: any) => t.id === editTournamentId);
                    if (existingTournament) {
                        const updatedTournament: Tournament = {
                            ...existingTournament,
                            ...commonData,
                        };
                        updateTournament(updatedTournament);
                        setSuccessMessage('Tournament updated successfully!');
                        setPendingNavigate(`/tournament/${editTournamentId}`);
                        setShowSuccess(true);
                    }
                } else {
                    // Create New
                    const newTournament: Tournament = {
                        id: Date.now().toString(),
                        status: 'upcoming',
                        ...commonData,
                    };
                    addTournament(newTournament);
                    setSuccessMessage('Tournament created successfully!');
                    setPendingNavigate(`/tournament/${newTournament.id}`);
                    setShowSuccess(true);
                }
            }
        }
    };

    // Organiser Details (Read-only)
    const organiserName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User';
    const organiserPhone = '+91 98765 43210';
    const organiserEmail = currentUser?.email || 'guest@example.com';

    return (
        <PageContainer>
            <SuccessOverlay
                isVisible={showSuccess}
                message={successMessage}
                onClose={() => pendingNavigate && navigate(pendingNavigate)}
            />
            <PageHeader
                title={view === 'review' ? 'Review Details' : (isEditMode ? 'Edit Tournament' : `Create ${sportName} Tournament`)}
                description={view === 'review' ? 'Review and confirm tournament details' : `Organize a professional ${sportName.toLowerCase()} tournament`}
                actions={
                    <Button
                        onClick={handleNext}
                        disabled={!isFormValid}
                        variant="primary"
                        className="gap-2"
                    >
                        <span>{view === 'review' ? (isEditMode ? 'Update Tournament' : 'Create Tournament') : 'Next'}</span>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                }
            />

            <div className="max-w-3xl mx-auto space-y-6">

                {view === 'form' ? (
                    <>
                        <Card className="p-6">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-blue-600" />
                                    Branding
                                </h3>

                                {/* Banner Upload */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Tournament banner
                                    </label>
                                    <div
                                        className={`relative group w-full aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden
                                ${isBannerDragActive
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                                            }
                            `}
                                        onDragOver={(e) => handleDragOver(e, setIsBannerDragActive)}
                                        onDragLeave={(e) => handleDragLeave(e, setIsBannerDragActive)}
                                        onDrop={(e) => handleDrop(e, setBannerUrl, setIsBannerDragActive)}
                                    >
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/gif"
                                            onChange={(e) => handleFileSelect(e, setBannerUrl)}
                                            className="hidden"
                                            id="banner-upload"
                                        />

                                        {bannerUrl ? (
                                            <>
                                                <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label
                                                        htmlFor="banner-upload"
                                                        className="cursor-pointer flex items-center gap-2 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        <span>Change banner</span>
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                <span className="text-sm text-slate-400 mb-3">No file chosen</span>
                                                <label
                                                    htmlFor="banner-upload"
                                                    className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload banner (optional)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Tournament logo
                                    </label>
                                    <div
                                        className={`relative group w-32 h-32 rounded-xl border-2 border-dashed transition-all overflow-hidden
                                ${isLogoDragActive
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                                            }
                            `}
                                        onDragOver={(e) => handleDragOver(e, setIsLogoDragActive)}
                                        onDragLeave={(e) => handleDragLeave(e, setIsLogoDragActive)}
                                        onDrop={(e) => handleDrop(e, setLogoUrl, setIsLogoDragActive)}
                                    >
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/gif"
                                            onChange={(e) => handleFileSelect(e, setLogoUrl)}
                                            className="hidden"
                                            id="logo-upload"
                                        />

                                        {logoUrl ? (
                                            <Avatar
                                                src={logoUrl}
                                                alt="Logo Preview"
                                                className="w-full h-full rounded-xl"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                                <span className="text-[10px] text-slate-400 mb-2">No file chosen</span>
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                                                >
                                                    Upload logo
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Basic Info
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Tournament Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Premier League 2024"
                                        required
                                    />
                                    <Select
                                        label="Category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        options={CATEGORY_OPTIONS}
                                        disabled={hasMatches}
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="e.g. Bengaluru"
                                        required
                                        startIcon={<MapPin size={18} />}
                                    />
                                    <Input
                                        label="Ground"
                                        value={ground}
                                        onChange={(e) => setGround(e.target.value)}
                                        placeholder="e.g. Chinnaswamy Stadium"
                                        required
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Dates
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Start Date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="End Date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        required
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    Playing Conditions
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Select
                                        label={sportConfig.ballTypeLabel}
                                        value={ballType}
                                        onChange={(e: any) => setBallType(e.target.value)}
                                        options={BALL_TYPE_OPTIONS}
                                        disabled={hasMatches}
                                    />
                                    <Input
                                        label={sportConfig.pitchTypeLabel}
                                        value={pitchType}
                                        onChange={(e) => setPitchType(e.target.value)}
                                        placeholder={sportConfig.pitchTypePlaceholder}
                                    />
                                    <Select
                                        label={sportConfig.matchTypeLabel}
                                        value={matchType}
                                        onChange={(e: any) => setMatchType(e.target.value)}
                                        options={MATCH_TYPE_OPTIONS}
                                        disabled={hasMatches}
                                    />
                                </div>
                            </div>
                        </Card>
                    </>
                ) : (
                    <Card className="p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Confirm Details</h3>

                        <div className="space-y-8">
                            <div className="flex flex-col items-center">
                                {bannerUrl && (
                                    <img src={bannerUrl} alt="Banner" className="w-full h-48 object-cover rounded-xl mb-4" />
                                )}
                                {logoUrl && (
                                    <img src={logoUrl} alt="Logo" className="w-24 h-24 rounded-full border-4 border-white shadow-lg -mt-16 bg-white" />
                                )}
                                <h2 className="text-2xl font-bold text-slate-900 mt-4">{name}</h2>
                                <div className="flex items-center gap-2 text-slate-600 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {ground}, {city}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase">Category</span>
                                    <span className="font-bold text-slate-800">{CATEGORY_OPTIONS.find(c => c.value === category)?.label}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase">{sportConfig.ballTypeLabel}</span>
                                    <span className="font-bold text-slate-800">{BALL_TYPE_OPTIONS.find(c => c.value === ballType)?.label || ballType}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase">{sportConfig.matchTypeLabel}</span>
                                    <span className="font-bold text-slate-800">{MATCH_TYPE_OPTIONS.find(c => c.value === matchType)?.label || matchType}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase">{sportConfig.pitchTypeLabel}</span>
                                    <span className="font-bold text-slate-800">{pitchType || 'Standard'}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Organizer Contact</h4>
                                    <p className="text-blue-700 text-xs mt-1">
                                        {organiserName} • {organiserPhone}<br />
                                        {organiserEmail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

            </div>
        </PageContainer>
    );
};
