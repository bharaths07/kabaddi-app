import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Insight } from '../hooks/useStats';
import { TrendingUp, TrendingDown, Star, Zap } from 'lucide-react';

interface StatsInsightsTabProps {
    insights: Insight[];
}

export const StatsInsightsTab: React.FC<StatsInsightsTabProps> = ({ insights }) => {
    if (insights.length === 0) {
        return (
            <div className="p-12 text-center text-slate-500 bg-white">
                <Star className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                <p>No major performance insights detected yet.</p>
                <p className="text-sm">Keep scoring matches to see trends and highlights.</p>
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50">
            {insights.map((insight) => (
                <Card key={insight.id} className="p-5 border-none shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                                insight.type === 'negative' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                            }`}>
                            {insight.type === 'positive' ? <TrendingUp size={24} /> :
                                insight.type === 'negative' ? <TrendingDown size={24} /> :
                                    <Zap size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight mb-1">{insight.title}</h3>
                            <p className="text-sm text-slate-600">{insight.description}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
