import React, { useEffect, useState } from 'react';
import styles from './TeamConfirmAnimation.module.css';
import { Calendar, MapPin } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

// Use a simplified Team interface to be flexible
export interface TeamProp {
  id: string;
  name: string;
  logoUrl?: string;
  color?: string; // Fallback color
}

export interface TeamConfirmAnimationProps {
  teamA: TeamProp;
  teamB: TeamProp;
  matchId: string;
  onComplete?: () => void;
}

interface MatchDetails {
  date: string;
  venue: string;
  winProbability: number; // 0-100
  lastFive: ('W' | 'L' | 'D')[];
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API
const fetchMatchDetails = async (): Promise<MatchDetails> => {
  await wait(600); // Simulate network latency (should be faster than total animation if parallel)
  return {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    winProbability: 65, // Random stat
    lastFive: ['W', 'W', 'L', 'W', 'D']
  };
};

export const TeamConfirmAnimation: React.FC<TeamConfirmAnimationProps> = ({
  teamA,
  teamB,
  matchId,
  onComplete
}) => {
  const [step, setStep] = useState<'idle' | 'ascending' | 'revealed' | 'expanded'>('idle');
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [ariaMessage, setAriaMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      // Step 1: Trigger Ascent (Immediate)
      // Slight delay to allow DOM render
      await wait(50);
      if (!isMounted) return;
      
      setStep('ascending');
      // Fetch details in parallel
      const detailsPromise = fetchMatchDetails();
      
      // Step 2: Wait for ascent (400ms)
      await wait(400);
      if (!isMounted) return;

      // Step 3: Reveal "VS" Label
      setStep('revealed');
      
      // Wait for fade in (250ms)
      await wait(250);
      if (!isMounted) return;

      // Step 4: Expand Details
      setStep('expanded');
      
      // Wait for details data if not ready
      try {
        const fetchedDetails = await detailsPromise;
        if (isMounted) setDetails(fetchedDetails);
      } catch (e) {
        console.error("Failed to fetch match details", e);
      }

      // Wait for expansion (350ms)
      await wait(350);
      
      if (isMounted) {
        setAriaMessage('Team selected, details expanded');
        onComplete?.();
      }
    };

    runSequence();

    return () => { isMounted = false; };
  }, [matchId, onComplete]);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  const getColor = (name: string) => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={styles.container} role="dialog" aria-modal="true" aria-label="Match Confirmation">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {ariaMessage}
      </div>

      {/* Main Card Wrapper */}
      <div className={`${styles.cardWrapper} ${step !== 'idle' ? styles.ascended : ''}`}>
        
        {/* The Team Card */}
        <div className={styles.teamCard}>
          {/* Team A */}
          <div className="flex flex-col items-center gap-2">
            <div 
              className={`${styles.teamAvatar} [background-color:${teamA.color || getColor(teamA.name)}]`}
            >
              <Avatar
                src={teamA.logoUrl}
                fallback={getInitials(teamA.name)}
                className="h-full w-full bg-transparent text-inherit"
              />
            </div>
          </div>

          {/* VS Badge (Visual Only, part of card) */}
          <div className={styles.vsBadge}>VS</div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-2">
            <div 
              className={`${styles.teamAvatar} [background-color:${teamB.color || getColor(teamB.name)}]`}
            >
              <Avatar
                src={teamB.logoUrl}
                fallback={getInitials(teamB.name)}
                className="h-full w-full bg-transparent text-inherit"
              />
            </div>
          </div>
        </div>

        {/* Versus Label (Fades in below card) */}
        <div 
          className={styles.versusLabel}
          data-visible={step === 'revealed' || step === 'expanded'}
        >
           <div className={styles.versusText}>
             {teamA.name} vs {teamB.name}
           </div>
        </div>

        {/* Details Panel (Slides down) */}
        <div 
          className={styles.detailsPanel}
          data-expanded={step === 'expanded'}
        >
          <div className={styles.detailsContent}>
            {details ? (
              <>
                <div className={styles.detailRow}>
                  <Calendar className={styles.detailIcon} />
                  <span className="font-medium">{details.date}</span>
                </div>
                <div className={styles.detailRow}>
                  <MapPin className={styles.detailIcon} />
                  <span>{details.venue}</span>
                </div>

                <div className={styles.statGrid}>
                   <div className={styles.statItem}>
                     <div className={styles.statLabel}>Win Prob</div>
                     <div className={`${styles.statValue} text-emerald-600`}>{details.winProbability}%</div>
                   </div>
                   <div className={styles.statItem}>
                     <div className={styles.statLabel}>Form</div>
                     <div className="flex justify-center gap-1">
                       {details.lastFive.map((res, i) => (
                         <span 
                           key={i} 
                           className={`text-[10px] w-4 h-4 flex items-center justify-center rounded ${
                             res === 'W' ? 'bg-green-100 text-green-700' : 
                             res === 'L' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                           }`}
                         >
                           {res}
                         </span>
                       ))}
                     </div>
                   </div>
                </div>
              </>
            ) : (
              // Loading state for details (if network is slower than animation)
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-20 bg-slate-100 rounded mt-2"></div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
