import React from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Card } from '@/shared/components/ui/Card';
import { Bell, ChevronRight } from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { notifications, dismissNotification, clearAllNotifications } = useGlobalState();
  const items = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getLabel = (t: string) => {
    if (t === 'match_start') return 'Match Start';
    if (t === 'match_result') return 'Match Result';
    return 'Tournament';
  };

  const getLabelColor = (t: string) => {
    if (t === 'match_start') return 'text-green-600 bg-green-50';
    if (t === 'match_result') return 'text-blue-600 bg-blue-50';
    return 'text-purple-600 bg-purple-50';
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Notifications" 
        description="Stay updated with your matches and tournaments"
        actions={
          items.length > 0 ? (
            <button
              type="button"
              onClick={() => clearAllNotifications()}
              className="px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Clear all notifications"
            >
              Clear All
            </button>
          ) : undefined
        }
      />
      
      {items.length === 0 ? (
        <EmptyState 
          icon={<Bell size={48} />}
          message="No notifications yet"
          description="We'll notify you when important events happen."
        />
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {items.map(n => (
            <Card key={n.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${getLabelColor(n.type)}`}>
                      {getLabel(n.type)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900">{n.title}</h4>
                  <p className="text-sm text-slate-600">{n.body}</p>
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                  {n.relatedMatchId && (
                    <Link 
                      to={`/match/${n.relatedMatchId}`} 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="View Match"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                  {n.relatedTournamentId && (
                    <Link 
                      to={`/tournament/${n.relatedTournamentId}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="View Tournament"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => dismissNotification(n.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Dismiss"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
