import { useState, useEffect, useMemo } from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { searchService, SearchResults } from '@/shared/api/searchService';

interface SearchOptions {
  limit?: number;
}

export const useSearchLogic = (searchTerm: string, options: SearchOptions = {}) => {
  const { matches, teams, tournaments } = useGlobalState();
  const limit = options.limit ?? 5;

  const [isLoading, setIsLoading] = useState(false);
  const [serverResults, setServerResults] = useState<SearchResults>({
    matches: [],
    teams: [],
    tournaments: []
  });

  // 1. Preprocessing & Abbreviations (Shared between client/server logic)
  const ABBREVIATIONS: Record<string, string> = {
    'wi': 'west indies',
    'csk': 'chennai super kings',
    't20 wc': 't20 world cup',
    'rcb': 'royal challengers bangalore',
    'mi': 'mumbai indians',
    'ind': 'india',
    'aus': 'australia',
    'eng': 'england'
  };

  const getProcessedTerm = (raw: string) => {
    const lower = raw.trim().toLowerCase();
    return ABBREVIATIONS[lower] || lower;
  };

  // 2. Debounced Server Search
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setServerResults({ matches: [], teams: [], tournaments: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchService.globalSearch(term, limit);
        setServerResults(results);
      } catch (error) {
        console.error('[useSearchLogic] Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, limit]);

  // 3. Fallback/Hybrid Client-side Filtering
  // We use this if serverResults are empty or while loading to provide instant feedback from local cache
  const clientResults = useMemo(() => {
    const term = getProcessedTerm(searchTerm);
    if (!term || term.length < 1) return { matches: [], teams: [], tournaments: [] };

    const POPULAR_TEAMS = ['india', 'australia', 'royal strikers', 'chennai super kings'];

    const matchedMatches = matches.filter((m: any) => {
      const home = m.homeParticipant.name.toLowerCase();
      const away = m.awayParticipant.name.toLowerCase();
      const vs = `${home} vs ${away}`;
      return vs.includes(term) || home.includes(term) || away.includes(term);
    }).sort((a: any, b: any) => {
      const statusScore = (s: string) => {
        if (s === 'live') return 3;
        if (s === 'draft') return 2;
        return 1;
      };
      const scoreA = statusScore(a.status);
      const scoreB = statusScore(b.status);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }).slice(0, limit);

    const matchedTeams = teams.filter((t: any) => t.name.toLowerCase().includes(term)).sort((a: any, b: any) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA === term && nameB !== term) return -1;
      if (nameB === term && nameA !== term) return 1;
      const isPopA = POPULAR_TEAMS.some(p => nameA.includes(p));
      const isPopB = POPULAR_TEAMS.some(p => nameB.includes(p));
      if (isPopA && !isPopB) return -1;
      if (!isPopA && isPopB) return 1;
      return nameA.localeCompare(nameB);
    }).slice(0, limit);

    const matchedTournaments = tournaments.filter((t: any) => t.name.toLowerCase().includes(term)).sort((a: any, b: any) => {
      const statusScore = (s: string) => (s === 'ongoing' || s === 'upcoming') ? 2 : 1;
      return statusScore(b.status) - statusScore(a.status);
    }).slice(0, limit);

    return { matches: matchedMatches, teams: matchedTeams, tournaments: matchedTournaments };
  }, [searchTerm, matches, teams, tournaments, limit]);

  // 4. Merge Results (Priority to Server, but use Client results if server is empty/loading)
  // This ensures that even if DB is empty or during offline/dev, the search still "works".
  const finalResults = useMemo(() => {
    const hasServerResults = serverResults.matches.length > 0 || serverResults.teams.length > 0 || serverResults.tournaments.length > 0;

    if (hasServerResults) {
      return serverResults;
    }

    return clientResults;
  }, [serverResults, clientResults]);

  return {
    ...finalResults,
    isLoading
  };
};
