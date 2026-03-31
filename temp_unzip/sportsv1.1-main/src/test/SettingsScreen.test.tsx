// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsScreen } from '@/features/system/pages/SettingsScreen';
import * as AppProviders from '@/app/AppProviders';


describe('SettingsScreen', () => {
  const mockUpdatePreferences = vi.fn();
  const mockSetNotificationsEnabled = vi.fn();
  const mockSetMatchStartEnabled = vi.fn();
  const mockSetMatchResultEnabled = vi.fn();
  const mockSetTournamentNotificationsEnabled = vi.fn();
  const mockUpdateUserProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AppProviders, 'useGlobalState').mockReturnValue({
      currentUser: { id: 'u1', name: 'Test User', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      logout: vi.fn(),
      followedTeams: [],
      followedTournaments: [],
      teams: [],
      tournaments: [],
      toggleFollowTeam: vi.fn(),
      toggleFollowTournament: vi.fn(),
      notificationsEnabled: true,
      setNotificationsEnabled: mockSetNotificationsEnabled,
      matchStartEnabled: true,
      setMatchStartEnabled: mockSetMatchStartEnabled,
      matchResultEnabled: true,
      setMatchResultEnabled: mockSetMatchResultEnabled,
      tournamentNotificationsEnabled: true,
      setTournamentNotificationsEnabled: mockSetTournamentNotificationsEnabled,
      preferences: { sport: 'Cricket', timezone: 'Asia/Kolkata', language: 'English', theme: 'light', accent: 'amber', denseMode: false, showAnimations: true, publicProfile: true, showOnlineStatus: true },
      updatePreferences: mockUpdatePreferences,
      updateUserProfile: mockUpdateUserProfile
    } as unknown as ReturnType<typeof AppProviders.useGlobalState>);
  });

  afterEach(() => {
    cleanup();
  });

  it('toggles dark mode and updates preferences', () => {
    render(<SettingsScreen />);
    const darkModeButton = screen.getByRole('button', { name: /Light|Dark/i });
    fireEvent.click(darkModeButton);
    expect(mockUpdatePreferences).toHaveBeenCalled();
  });

  it('saves general settings', () => {
    render(<SettingsScreen />);
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    expect(mockUpdatePreferences).toHaveBeenCalled();
  });

  it('validates email on account save', () => {
    render(<SettingsScreen />);
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Save Account Changes'));
    expect(screen.getByText('Please enter a valid email address')).toBeTruthy();
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });
});
