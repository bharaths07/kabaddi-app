import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { useSearchLogic } from '@/shared/hooks/useSearchLogic';
import { Input } from './ui/Input';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentSearchItem {
  id: string;
  name: string;
  type: 'match' | 'team' | 'tournament';
  label: string; // Display label e.g., "Match", "Team"
  subtitle: string;
  path: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = 'scoreheroes_recent_searches';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useGlobalState();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  // Clear history on logout
  useEffect(() => {
    if (!currentUser) {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, [currentUser]);

  // Focus input when opened and handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
      setActiveIndex(-1);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setSearchTerm('');
    setActiveIndex(-1);
    onClose();
  };

  // Search Logic
  const { matches: matchedMatches, teams: matchedTeams, tournaments: matchedTournaments, isLoading } = useSearchLogic(searchTerm, { limit: 5 });

  const flatResults = useMemo(() => {
    return [...matchedMatches, ...matchedTeams, ...matchedTournaments];
  }, [matchedMatches, matchedTeams, matchedTournaments]);

  const addToHistory = (item: Omit<RecentSearchItem, 'timestamp'>) => {
    const newItem = { ...item, timestamp: Date.now() };
    setRecentSearches(prev => {
      // Remove duplicates by ID
      const filtered = prev.filter(i => i.id !== item.id);
      // Add new item to top
      const updated = [newItem, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleNavigate = (path: string, item?: Omit<RecentSearchItem, 'timestamp'>) => {
    if (item) {
      addToHistory(item);
    }
    navigate(path);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      setActiveIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        const item = flatResults[activeIndex];
        // Map domain object to RecentSearchItem format for history
        if ('homeParticipant' in item) {
          handleNavigate(`/match/${item.id}`, {
            id: item.id,
            name: `${item.homeParticipant.name} vs ${item.awayParticipant.name}`,
            type: 'match',
            label: 'Match',
            subtitle: item.status,
            path: `/match/${item.id}`
          });
        } else if ('organizer' in item) {
          handleNavigate(`/tournament/${item.id}`, {
            id: item.id,
            name: item.name,
            type: 'tournament',
            label: 'Tournament',
            subtitle: item.organizer,
            path: `/tournament/${item.id}`
          });
        } else {
          handleNavigate(`/team/${item.id}`, {
            id: item.id,
            name: item.name,
            type: 'team',
            label: 'Team',
            subtitle: 'Team',
            path: `/team/${item.id}`
          });
        }
      } else {
        // Search term enter - go to results page
        if (searchTerm.trim().length > 0) {
          handleNavigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-[600px] max-w-[90vw] bg-bg-base border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-5 py-4 border-b border-border gap-3 bg-bg-surface-1">
          <div className="flex-1 flex items-center relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search teams, matches, or tournaments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              startIcon={Search}
              className="border-none bg-transparent focus:ring-0 text-lg shadow-none px-0 py-0 h-auto placeholder:text-text-muted"
              containerClassName="flex-1"
            />
            {searchTerm && (
              <button
                className="absolute right-0 text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-bg-surface-2 transition-colors"
                onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className="text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface-2 px-2 py-1 rounded transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {searchTerm.length < 2 ? (
            // EMPTY STATE / RECENT SEARCHES
            <div className="p-2">
              {recentSearches.length > 0 ? (
                <div className="py-2">
                  <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <span>Recent Searches</span>
                    <button onClick={clearHistory} className="text-primary hover:text-primary-dark hover:underline">Clear</button>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer hover:bg-bg-surface-2 transition-colors"
                        onClick={() => handleNavigate(item.path, item)}
                      >
                        <Clock className="w-4 h-4 text-text-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium text-text-primary truncate">{item.name}</span>
                          <span className="block text-xs text-text-secondary truncate">{item.label} • {item.subtitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-text-muted text-sm">
                  Start typing to find matches, teams, and tournaments.
                </div>
              )}
            </div>
          ) : (
            // RESULTS LIST
            <div className="p-2 space-y-2 relative">
              {isLoading && (
                <div className="absolute inset-x-0 -top-2 h-1 overflow-hidden">
                  <div className="h-full bg-primary animate-[progress_1s_ease-in-out_infinite]" />
                </div>
              )}
              {flatResults.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  {isLoading ? 'Searching...' : `No results found for "${searchTerm}"`}
                </div>
              ) : (
                <>
                  {matchedMatches.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-text-muted bg-bg-surface-1/50 backdrop-blur sticky top-0">Matches</div>
                      {matchedMatches.map((m: any, idx: number) => {
                        const globalIdx = idx; // matches are first
                        return (
                          <div
                            key={m.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${activeIndex === globalIdx ? 'bg-bg-surface-2' : 'hover:bg-bg-surface-2'}`}
                            onClick={() => handleNavigate(`/match/${m.id}`, {
                              id: m.id,
                              name: `${m.homeParticipant.name} vs ${m.awayParticipant.name}`,
                              type: 'match',
                              label: 'Match',
                              subtitle: m.status,
                              path: `/match/${m.id}`
                            })}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text-primary truncate">{m.homeParticipant.name} vs {m.awayParticipant.name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">{m.status}</span>
                              </div>
                              <span className="block text-xs text-text-secondary truncate">
                                {m.tournamentId} • {new Date(m.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {matchedTeams.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-text-muted bg-bg-surface-1/50 backdrop-blur sticky top-0">Teams</div>
                      {matchedTeams.map((t: any, idx: number) => {
                        const globalIdx = matchedMatches.length + idx;
                        return (
                          <div
                            key={t.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${activeIndex === globalIdx ? 'bg-bg-surface-2' : 'hover:bg-bg-surface-2'}`}
                            onClick={() => handleNavigate(`/team/${t.id}`, {
                              id: t.id,
                              name: t.name,
                              type: 'team',
                              label: 'Team',
                              subtitle: 'Team',
                              path: `/team/${t.id}`
                            })}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="block font-medium text-text-primary truncate">{t.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {matchedTournaments.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-text-muted bg-bg-surface-1/50 backdrop-blur sticky top-0">Tournaments</div>
                      {matchedTournaments.map((t: any, idx: number) => {
                        const globalIdx = matchedMatches.length + matchedTeams.length + idx;
                        return (
                          <div
                            key={t.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${activeIndex === globalIdx ? 'bg-bg-surface-2' : 'hover:bg-bg-surface-2'}`}
                            onClick={() => handleNavigate(`/tournament/${t.id}`, {
                              id: t.id,
                              name: t.name,
                              type: 'tournament',
                              label: 'Tournament',
                              subtitle: t.organizer,
                              path: `/tournament/${t.id}`
                            })}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text-primary truncate">{t.name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">{t.status}</span>
                              </div>
                              <span className="block text-xs text-text-secondary truncate">
                                {t.organizer}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
