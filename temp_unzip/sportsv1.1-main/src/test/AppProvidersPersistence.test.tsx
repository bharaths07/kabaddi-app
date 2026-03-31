// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProviders, useGlobalState } from '@/app/AppProviders';
import React from 'react';

const TestComponent: React.FC = () => {
  const { updatePreferences } = useGlobalState();
  React.useEffect(() => {
    updatePreferences({ theme: 'dark', accent: 'blue' });
  }, [updatePreferences]);
  return <div>ok</div>;
};

describe('AppProviders persistence', () => {
  it('persists preferences to localStorage', () => {
    render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );
    const raw = localStorage.getItem('scoreheroes_preferences');
    expect(raw).toBeTruthy();
    const prefs = JSON.parse(raw!);
    expect(prefs.theme).toBe('dark');
    expect(prefs.accent).toBe('blue');
  });
});
