import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Shield, ArrowRight } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

type Format = 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT';

export const TournamentStructureScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, updateTournamentStructure } = useGlobalState();

  const tournament = tournaments.find(t => t.id === id);

  const [format, setFormat] = useState<Format | null>(null);
  const [rounds, setRounds] = useState<number>(1);
  const [groups, setGroups] = useState<number>(2);
  const [qualifiedPerGroup, setQualifiedPerGroup] = useState<number>(2);

  const handleSave = () => {
    if (!id || !format) return;

    const structure = {
      format,
      rounds: format === 'LEAGUE' ? rounds : undefined,
      groups: format === 'GROUP_KNOCKOUT' ? groups : undefined,
      qualifiedPerGroup: format === 'GROUP_KNOCKOUT' ? qualifiedPerGroup : undefined,
    };

    updateTournamentStructure(id, structure);
    navigate(`/tournament/${id}/schedule`);
  };

  const isFormValid = () => {
    if (!format) return false;
    if (format === 'LEAGUE' && rounds < 1) return false;
    if (format === 'GROUP_KNOCKOUT' && (groups < 1 || qualifiedPerGroup < 1)) return false;
    return true;
  };

  if (!tournament) return <div>Tournament not found</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Groups / Rounds"
        description="Set up how teams will compete"

        actions={
          <Button
            onClick={handleSave}
            disabled={!isFormValid()}
            variant="primary"
            className="gap-2"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto space-y-8">

        {/* Section 1: Select Format */}
        <section className="space-y-4">
          <label className="text-sm font-bold text-slate-700 uppercase">Select format *</label>
          <div className="grid grid-cols-1 gap-3">
            <Card
              onClick={() => setFormat('LEAGUE')}
              className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-2
                ${format === 'LEAGUE'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${format === 'LEAGUE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
              `}>
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold ${format === 'LEAGUE' ? 'text-blue-900' : 'text-slate-800'}`}>League (Points Table)</h3>
                <p className="text-xs text-slate-500">All teams play each other. Top teams win.</p>
              </div>
            </Card>

            <Card
              onClick={() => setFormat('KNOCKOUT')}
              className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-2
                ${format === 'KNOCKOUT'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${format === 'KNOCKOUT' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
              `}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold ${format === 'KNOCKOUT' ? 'text-blue-900' : 'text-slate-800'}`}>Knockout</h3>
                <p className="text-xs text-slate-500">Lose and you're out. Last team standing wins.</p>
              </div>
            </Card>

            <Card
              onClick={() => setFormat('GROUP_KNOCKOUT')}
              className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-2
                ${format === 'GROUP_KNOCKOUT'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${format === 'GROUP_KNOCKOUT' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
              `}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold ${format === 'GROUP_KNOCKOUT' ? 'text-blue-900' : 'text-slate-800'}`}>Group + Knockout</h3>
                <p className="text-xs text-slate-500">Groups first, then top teams qualify for knockouts.</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 2: Structure Configuration */}
        {format && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="p-6 space-y-6">

              {format === 'LEAGUE' && (
                <div className="space-y-2">
                  <Input
                    label="Rounds *"
                    type="number"
                    min={1}
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 0)}
                    placeholder="1"
                    className="font-bold text-lg"
                  />
                  <p className="text-xs text-slate-500">Each team plays others {rounds} time(s).</p>
                </div>
              )}

              {format === 'KNOCKOUT' && (
                <div className="text-center py-4">
                  <p className="text-slate-600 font-medium">Teams will be eliminated after each match.</p>
                  <p className="text-xs text-slate-400 mt-1">No additional configuration required.</p>
                </div>
              )}

              {format === 'GROUP_KNOCKOUT' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      label="Number of groups *"
                      type="number"
                      min={1}
                      value={groups}
                      onChange={(e) => setGroups(parseInt(e.target.value) || 0)}
                      className="font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Teams qualified per group *"
                      type="number"
                      min={1}
                      value={qualifiedPerGroup}
                      onChange={(e) => setQualifiedPerGroup(parseInt(e.target.value) || 0)}
                      className="font-bold text-lg"
                    />
                  </div>
                </div>
              )}

            </Card>
          </section>
        )}

      </div>
    </PageContainer>
  );
};
