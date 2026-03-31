// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TournamentListScreen } from '@/features/tournaments/pages/TournamentListScreen';
import * as AppProviders from '@/app/AppProviders';
import React from 'react';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

// Mock Data
const mockUser = { id: 'u1', name: 'Test User' };
const mockPlayer = { id: 'p1', userId: 'u1' };
const mockTeam = { id: 't1', members: [{ playerId: 'p1' }] };

const mockTournaments = [
  {
    id: '1',
    name: 'Upcoming League',
    dates: '2025-01-01',
    status: 'upcoming',
    sportId: 's1', // Cricket
    level: 'City',
    structure: { format: 'LEAGUE' },
    organizerId: 'u1',
    bannerUrl: 'test.jpg'
  },
  {
    id: '2',
    name: 'Ongoing Knockout',
    dates: '2025-02-01',
    status: 'ongoing',
    sportId: 's2', // Football
    level: 'State',
    structure: { format: 'KNOCKOUT' },
    scorers: ['u1'],
    bannerUrl: 'test.jpg'
  },
  {
    id: '3',
    name: 'Completed Group',
    dates: '2025-03-01',
    status: 'completed',
    sportId: 's3', // Kabaddi
    level: 'Institute',
    structure: { format: 'GROUP_KNOCKOUT' },
    teams: ['t1'],
    bannerUrl: 'test.jpg'
  }
];

describe('TournamentListFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup
    vi.spyOn(AppProviders, 'useGlobalState').mockReturnValue({
      tournaments: mockTournaments,
      currentUser: mockUser,
      teams: [mockTeam],
      players: [mockPlayer]
    } as unknown as ReturnType<typeof AppProviders.useGlobalState>);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders UI correctly', () => {
    render(<TournamentListScreen />);

    expect(screen.getByText('Tournaments')).toBeTruthy();
    expect(screen.getByText('Create Tournament')).toBeTruthy();
    expect(screen.getByPlaceholderText('Search tournaments...')).toBeTruthy();

    // Check Tabs
    expect(screen.getByText('Ongoing')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();

    // Check Filters
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2); // Sport and Type filters
    expect(screen.getByText('All Sports')).toBeTruthy();
    expect(screen.getByText('All Types')).toBeTruthy();
  });

  it('filters by status (Tabs)', async () => {
    render(<TournamentListScreen />);

    // Default is Ongoing
    expect(screen.getByText('Ongoing Knockout')).toBeTruthy();
    expect(screen.queryByText('Upcoming League')).toBeNull();
    expect(screen.queryByText('Completed Group')).toBeNull();

    // Click Upcoming
    fireEvent.click(screen.getByText('Upcoming'));
    await waitFor(() => {
      expect(screen.getByText('Upcoming League')).toBeTruthy();
    });
    expect(screen.queryByText('Ongoing Knockout')).toBeNull();

    // Click Completed
    fireEvent.click(screen.getByText('Completed'));
    await waitFor(() => {
      expect(screen.getByText('Completed Group')).toBeTruthy();
    });
    expect(screen.queryByText('Upcoming League')).toBeNull();
  });

  it('filters by search', async () => {
    render(<TournamentListScreen />);

    // Switch to Upcoming tab first since we search for "Upcoming"
    fireEvent.click(screen.getByText('Upcoming'));

    const searchInput = screen.getByPlaceholderText('Search tournaments...');

    // Search for existing
    fireEvent.change(searchInput, { target: { value: 'Upcoming' } });
    await waitFor(() => {
      expect(screen.getByText('Upcoming League')).toBeTruthy();
    });

    // Search for non-existing in this tab
    fireEvent.change(searchInput, { target: { value: 'Ongoing' } });
    await waitFor(() => {
      expect(screen.queryByText('Upcoming League')).toBeNull();
      expect(screen.getByText('No tournaments found')).toBeTruthy();
    });
  });

  it('filters by Sport', async () => {
    render(<TournamentListScreen />);

    // Switch to Upcoming to test Cricket (s1)
    fireEvent.click(screen.getByText('Upcoming'));

    const sportSelect = screen.getAllByRole('combobox')[0]; // First select is Sport

    // Filter by Cricket
    fireEvent.change(sportSelect, { target: { value: 'cricket' } });
    await waitFor(() => {
      expect(screen.getByText('Upcoming League')).toBeTruthy();
    });

    // Filter by Football (should show empty in Upcoming tab)
    fireEvent.change(sportSelect, { target: { value: 'football' } });
    await waitFor(() => {
      expect(screen.queryByText('Upcoming League')).toBeNull();
    });
  });

  it('filters by Level', async () => {
    render(<TournamentListScreen />);

    // Switch to Upcoming to test City level
    fireEvent.click(screen.getByText('Upcoming'));

    const typeSelect = screen.getAllByRole('combobox')[1]; // Second select is Level/Type

    // Filter by City
    fireEvent.change(typeSelect, { target: { value: 'City' } });
    await waitFor(() => {
      expect(screen.getByText('Upcoming League')).toBeTruthy();
    });

    // Filter by State (should show empty in Upcoming tab)
    fireEvent.change(typeSelect, { target: { value: 'State' } });
    await waitFor(() => {
      expect(screen.queryByText('Upcoming League')).toBeNull();
    });
  });
});
