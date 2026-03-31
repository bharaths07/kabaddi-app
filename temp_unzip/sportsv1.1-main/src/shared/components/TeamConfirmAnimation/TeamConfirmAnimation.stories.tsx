import type { Meta, StoryObj } from '@storybook/react';

import { ComponentType } from 'react';
import { TeamConfirmAnimation } from './TeamConfirmAnimation';

const meta: Meta<typeof TeamConfirmAnimation> = {
  title: 'Animation/TeamConfirmAnimation',
  component: TeamConfirmAnimation,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onComplete: { action: 'completed' },
  },
};

export default meta;
type Story = StoryObj<typeof TeamConfirmAnimation>;

const mockTeamA = { 
  id: 't1', 
  name: 'Royal Challengers', 
  color: '#ef4444',
  logoUrl: 'https://ui-avatars.com/api/?name=RC&background=ef4444&color=fff' 
};

const mockTeamB = { 
  id: 't2', 
  name: 'Chennai Kings', 
  color: '#f59e0b',
  logoUrl: 'https://ui-avatars.com/api/?name=CK&background=f59e0b&color=fff' 
};

export const Default: Story = {
  args: {
    teamA: mockTeamA,
    teamB: mockTeamB,
    matchId: 'm1',
  },
};

// Slow motion variant to verify animation details
export const SlowMotion: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story: ComponentType) => (
      // Override CSS variables for slower animation (2x duration)
      <div className="[--ascent-duration:800ms] [--ease-out-cubic:cubic-bezier(0.25,0.46,0.45,0.94)]">
        <Story />
      </div>
    ),
  ],
};

// Reduced motion variant is handled by browser preference or simulated media query
// Storybook usually has a toolbar item for this, but we can document it here.
export const ReducedMotionDescription: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'This component respects `prefers-reduced-motion`. Test by toggling the media query in developer tools.'
      }
    }
  }
};
