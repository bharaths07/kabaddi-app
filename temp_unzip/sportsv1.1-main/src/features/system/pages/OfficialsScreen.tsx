import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { Avatar } from '@/shared/components/ui/Avatar';

export const OfficialsScreen: React.FC = () => {
  const { matches, users } = useGlobalState();

  const officials = useMemo(() => {
    const officialStats = new Map<string, { matches: number, roles: Set<string> }>();

    matches.forEach(match => {
      match.officials?.forEach(official => {
        const stats = officialStats.get(official.userId) || { matches: 0, roles: new Set() };
        stats.matches += 1;
        stats.roles.add(official.role);
        officialStats.set(official.userId, stats);
      });
    });

    return Array.from(officialStats.entries())
      .map(([userId, stats]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          user,
          matches: stats.matches,
          roles: Array.from(stats.roles)
        };
      })
      .filter(item => item.user) // Only show if user exists
      .sort((a, b) => b.matches - a.matches);
  }, [matches, users]);

  return (
    <PageContainer>
      <PageHeader 
        title="Officials" 
        description="Umpires, referees, and scorers."
      />

      {officials.length === 0 ? (
        <EmptyState 
          icon={<Shield size={48} />}
          message="No officials found"
          description="Assign officials to matches to see them here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officials.map((item) => (
            <Card key={item.userId} className="p-4 flex items-center gap-4">
              <Avatar
                src={item.user?.avatarUrl}
                fallback={item.user?.name?.charAt(0) || 'U'}
                className="w-12 h-12 bg-slate-100 text-slate-600 font-bold"
              />
              <div>
                <div className="font-bold text-slate-900">{item.user?.name || 'Unknown User'}</div>
                <div className="text-xs text-slate-500 mb-1">
                  {item.matches} Match{item.matches !== 1 ? 'es' : ''}
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.roles.map(role => (
                    <span key={role} className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
