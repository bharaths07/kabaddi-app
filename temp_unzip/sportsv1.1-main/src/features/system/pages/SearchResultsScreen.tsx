import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchLogic } from '@/shared/hooks/useSearchLogic';
import './SearchResultsScreen.css';

export const SearchResultsScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  // Use a high limit for the full page results
  const results = useSearchLogic(query, { limit: 50 });

  const hasResults = results.matches.length > 0 || results.teams.length > 0 || results.tournaments.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'live') return 'status-live';
    if (s === 'draft' || s === 'upcoming') return 'status-upcoming';
    return 'status-completed';
  };

  if (!query) {
    return (
      <div className="search-results-page">
        <div className="no-results-container">
          <div className="no-results-text">Please enter a search term</div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <h1 className="search-results-title">
          Search results for <span className="search-query-highlight">"{query}"</span>
        </h1>
      </div>

      {!hasResults ? (
        <div className="no-results-container">
          <div className="no-results-icon">🔍</div>
          <div className="no-results-text">No results found</div>
          <div className="no-results-subtext">Try checking for typos or using broader terms.</div>
        </div>
      ) : (
        <>
          {/* Matches Section */}
          {results.matches.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">
                Matches <span className="search-section-count">{results.matches.length}</span>
              </div>
              <div className="results-grid">
                {results.matches.map(m => (
                  <div key={m.id} className="result-card" onClick={() => handleNavigate(`/match/${m.id}`)}>
                    <div className="result-type-badge">Match</div>
                    <div className="result-card-header">
                      <div className="result-card-title">
                        {m.homeParticipant.name} <span className="text-slate-500">vs</span> {m.awayParticipant.name}
                      </div>
                    </div>
                    <div className="result-card-subtitle">
                      <span className={`status-badge ${getStatusClass(m.status)}`}>{m.status}</span>
                    </div>
                    <div className="result-card-meta">
                      {m.tournamentId} • {new Date(m.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams Section */}
          {results.teams.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">
                Teams <span className="search-section-count">{results.teams.length}</span>
              </div>
              <div className="results-grid">
                {results.teams.map(t => (
                  <div key={t.id} className="result-card" onClick={() => handleNavigate(`/team/${t.id}`)}>
                    <div className="result-type-badge">Team</div>
                    <div className="result-card-header">
                      <div className="result-card-title">{t.name}</div>
                    </div>
                    <div className="result-card-subtitle">
                      {/* Could add team region/city if available */}
                      Team Profile
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tournaments Section */}
          {results.tournaments.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">
                Tournaments <span className="search-section-count">{results.tournaments.length}</span>
              </div>
              <div className="results-grid">
                {results.tournaments.map(t => (
                  <div key={t.id} className="result-card" onClick={() => handleNavigate(`/tournament/${t.id}`)}>
                    <div className="result-type-badge">Tournament</div>
                    <div className="result-card-header">
                      <div className="result-card-title">{t.name}</div>
                    </div>
                    <div className="result-card-subtitle">
                      <span className={`status-badge ${getStatusClass(t.status)}`}>{t.status}</span>
                    </div>
                    <div className="result-card-meta">
                      {t.organizer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
