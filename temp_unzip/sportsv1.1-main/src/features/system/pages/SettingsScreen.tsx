import React, { useMemo, useState } from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { stringToColor } from '@/shared/utils/colors';
import { Bell, Shield, User, Palette, Moon } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    logout,
    followedTeams,
    followedTournaments,
    teams,
    tournaments,
    toggleFollowTeam,
    toggleFollowTournament,
    notificationsEnabled,
    setNotificationsEnabled,
    matchStartEnabled,
    setMatchStartEnabled,
    matchResultEnabled,
    setMatchResultEnabled,
    tournamentNotificationsEnabled,
    setTournamentNotificationsEnabled,
    preferences,
    updatePreferences,
    updateUserProfile,
  } = useGlobalState();

  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getTournament = (id: string) => tournaments.find(t => t.id === id);
  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || ''
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [generalForm, setGeneralForm] = useState({
    sport: preferences.sport,
    timezone: preferences.timezone,
    language: preferences.language
  });
  const [generalError, setGeneralError] = useState<string | null>(null);
  const timezones = useMemo(() => [
    'UTC', 'Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles'
  ], []);

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="space-y-6 max-w-3xl mx-auto">
        
        {/* 1. ACCOUNT */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Account</h3>
          </div>
          <div className="p-6">
            {currentUser ? (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <Avatar 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    fallback={currentUser.name}
                    className={`w-20 h-20 text-2xl ${stringToColor(currentUser.name || '')}`}
                  />
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-500 mb-1 block">Name</label>
                      <div className="text-base font-medium text-slate-900">{currentUser.firstName} {currentUser.lastName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 mb-1 block">Email</label>
                      <div className="text-base font-medium text-slate-900">{currentUser.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-500 mb-1 block">Update First Name</label>
                      <input
                        value={profileForm.firstName}
                        onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        aria-label="First Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 mb-1 block">Update Last Name</label>
                      <input
                        value={profileForm.lastName}
                        onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        aria-label="Last Name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-500 mb-1 block">Update Email</label>
                      <input
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        aria-label="Email"
                      />
                    </div>
                  </div>
                  {profileError && <div className="text-sm text-red-600 mt-2">{profileError}</div>}
                  <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        setProfileError(null);
                        const emailValid = !profileForm.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email);
                        if (!emailValid) {
                          setProfileError('Please enter a valid email address');
                          return;
                        }
                        await updateUserProfile({
                          firstName: profileForm.firstName,
                          lastName: profileForm.lastName,
                          email: profileForm.email
                        });
                      }}
                    >
                      Save Account Changes
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">Sign in to manage your account and sync settings.</p>
                <Button onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* 2. FOLLOWING */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Following</h3>
          </div>
          
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2 text-sm text-blue-700">
            <span>ℹ</span> Match follows are temporary and end automatically after completion.
          </div>

          {followedTeams.length === 0 && followedTournaments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="font-medium text-slate-900 mb-2">
                You’re not following any teams or tournaments yet.
              </div>
              <div className="text-sm text-slate-500">
                Follow teams or tournaments to personalize your experience.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Teams */}
              {followedTeams.length > 0 && (
                <>
                  <div className="px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Teams You Follow
                  </div>
                  {[...followedTeams]
                    .map(id => getTeam(id))
                    .filter((t): t is NonNullable<typeof t> => !!t)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(team => (
                    <div key={team.id} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={team.logoUrl}
                          alt={team.name}
                          fallback={team.name}
                          className={`w-10 h-10 ${stringToColor(team.name)}`}
                        />
                        <div>
                          <span className="font-medium text-slate-900 block">{team.name}</span>
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Following</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                        onClick={() => toggleFollowTeam(team.id)}
                      >
                        Unfollow
                      </Button>
                    </div>
                  ))}
                </>
              )}

              {/* Tournaments */}
              {followedTournaments.length > 0 && (
                <>
                  <div className="px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tournaments You Follow
                  </div>
                  {[...followedTournaments]
                    .map(id => getTournament(id))
                    .filter((t): t is NonNullable<typeof t> => !!t)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(tournament => (
                    <div key={tournament.id} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-3">
                        <Avatar
                          src={tournament.logoUrl}
                          alt={tournament.name}
                          fallback={tournament.name}
                          className={`w-10 h-10 ${stringToColor(tournament.name)}`}
                        />
                        <div>
                          <span className="font-medium text-slate-900 block">{tournament.name}</span>
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Following</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                        onClick={() => toggleFollowTournament(tournament.id)}
                      >
                        Unfollow
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </Card>

        {/* 3. NOTIFICATIONS */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-900 mb-1">Allow Notifications</div>
                <div className="text-sm text-slate-500">Enable or disable all app notifications</div>
              </div>
              
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled} 
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Allow Notifications"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 mb-1">Match Start</div>
                  <div className="text-xs text-slate-500">Notify when followed matches start</div>
                </div>
                <input type="checkbox" aria-label="Match Start" checked={matchStartEnabled} onChange={e => setMatchStartEnabled(e.target.checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 mb-1">Match Result</div>
                  <div className="text-xs text-slate-500">Notify when followed matches end</div>
                </div>
                <input type="checkbox" aria-label="Match Result" checked={matchResultEnabled} onChange={e => setMatchResultEnabled(e.target.checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 mb-1">Tournament Events</div>
                  <div className="text-xs text-slate-500">Notify tournament updates and milestones</div>
                </div>
                <input type="checkbox" aria-label="Tournament Events" checked={tournamentNotificationsEnabled} onChange={e => setTournamentNotificationsEnabled(e.target.checked)} />
              </div>
            </div>
          </div>
        </Card>

        {/* 4. APPEARANCE */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Appearance</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-900 mb-1">Dark Mode</div>
                <div className="text-sm text-slate-500">Reduce glare and improve contrast</div>
              </div>
              <button
                type="button"
                onClick={() => updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-semibold">{preferences.theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            <div>
              <div className="font-medium text-slate-900 mb-2">Accent Color</div>
              <div className="grid grid-cols-6 gap-3">
                {([
                  { key: 'amber', class: 'bg-amber-500' },
                  { key: 'green', class: 'bg-green-500' },
                  { key: 'pink', class: 'bg-pink-500' },
                  { key: 'violet', class: 'bg-violet-600' },
                  { key: 'red', class: 'bg-red-500' },
                  { key: 'blue', class: 'bg-blue-600' },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => updatePreferences({ accent: opt.key })}
                    className={`h-8 rounded-full border ${opt.class} ${preferences.accent === opt.key ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-200'}`}
                    aria-label={`${opt.key} accent`}
                    title={opt.key}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 5. PRIVACY */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Privacy</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 mb-1">Public Profile</div>
                <div className="text-sm text-slate-500">Your profile is visible to everyone</div>
              </div>
              <input type="checkbox" aria-label="Public Profile" checked={preferences.publicProfile} onChange={e => updatePreferences({ publicProfile: e.target.checked })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 mb-1">Show Online Status</div>
                <div className="text-sm text-slate-500">Display when you are active</div>
              </div>
              <input type="checkbox" aria-label="Show Online Status" checked={preferences.showOnlineStatus} onChange={e => updatePreferences({ showOnlineStatus: e.target.checked })} />
            </div>
          </div>
        </Card>

        {/* 6. GENERAL */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">General</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="preferred-sport" className="text-sm font-medium text-slate-500 mb-1 block">Preferred Sport</label>
                <select id="preferred-sport" value={generalForm.sport} onChange={e => setGeneralForm({ ...generalForm, sport: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" aria-label="Preferred Sport">
                  {['Cricket', 'Football', 'Basketball', 'Badminton', 'Tennis'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="preferred-language" className="text-sm font-medium text-slate-500 mb-1 block">Language</label>
                <select id="preferred-language" value={generalForm.language} onChange={e => setGeneralForm({ ...generalForm, language: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" aria-label="Preferred Language">
                  {['English', 'Hindi', 'Spanish'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="preferred-timezone" className="text-sm font-medium text-slate-500 mb-1 block">Timezone</label>
                <select id="preferred-timezone" value={generalForm.timezone} onChange={e => setGeneralForm({ ...generalForm, timezone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" aria-label="Preferred Timezone">
                  {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>
            {generalError && <div className="text-sm text-red-600">{generalError}</div>}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setGeneralError(null);
                  if (!generalForm.language || !generalForm.timezone) {
                    setGeneralError('Please select language and timezone');
                    return;
                  }
                  updatePreferences(generalForm);
                }}
              >
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setGeneralForm({
                sport: preferences.sport, language: preferences.language, timezone: preferences.timezone
              })}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
