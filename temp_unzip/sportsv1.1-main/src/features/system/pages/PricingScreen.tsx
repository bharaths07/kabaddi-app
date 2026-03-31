import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Check, Shield, Zap } from 'lucide-react';

type PlanId = 'free' | 'premium' | 'enterprise';

const PLANS: Array<{
  id: PlanId;
  name: string;
  price: string;
  highlight: string;
  features: string[];
  cta: string;
}> = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    highlight: 'Get started',
    features: [
      'Create matches and teams',
      'Basic stats and feed',
      'Local storage syncing'
    ],
    cta: 'Continue Free'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹299/mo',
    highlight: 'Best for players',
    features: [
      'Advanced stats & leaderboards',
      'Media gallery enhancements',
      'Notifications & follow'
    ],
    cta: 'Upgrade to Premium'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Contact',
    highlight: 'Institutions & clubs',
    features: [
      'Multi-admin & roles',
      'Tournament automation',
      'Custom integrations'
    ],
    cta: 'Contact Sales'
  }
];

export const PricingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useGlobalState();
  const [selected, setSelected] = useState<PlanId>(currentUser?.plan || 'free');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: PlanId) => {
    if (!currentUser) {
      alert('Please sign in to upgrade your plan.');
      navigate('/login');
      return;
    }
    if (plan === 'enterprise') {
      alert('We will contact you shortly.');
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile({ plan });
      setSelected(plan);
      alert('Plan updated successfully');
    } catch {
      alert('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Upgrade Plan" 
        description="Choose the plan that fits your game."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map(plan => {
          const isActive = selected === plan.id;
          return (
            <Card 
              key={plan.id} 
              className={`p-6 flex flex-col gap-4 ${isActive ? 'border-blue-500 shadow-blue-100' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold uppercase text-slate-500">{plan.highlight}</div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                </div>
                <div className={`p-3 rounded-full ${plan.id === 'premium' ? 'bg-amber-50 text-amber-600' : plan.id === 'enterprise' ? 'bg-violet-50 text-violet-600' : 'bg-slate-50 text-slate-600'}`}>
                  {plan.id === 'premium' ? <Zap /> : plan.id === 'enterprise' ? <Shield /> : <Check />}
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{plan.price}</div>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={isActive ? 'secondary' : 'primary'}
                className="mt-2"
                isLoading={loading}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isActive ? 'Current Plan' : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
};
